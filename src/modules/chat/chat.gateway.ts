import {
  SubscribeMessage,
  OnGatewayConnection,
  WebSocketGateway,
  WsResponse,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { ChatService } from './chat.service';
import {
  ChannelDto,
  ReceivedMessageEventDto,
  SendMessageEventRequestDto,
  SendMessageEventResponseDto,
} from '../../contracts';
import { ChannelCreatedEventResponseDto } from 'src/contracts/ChannelCreatedEventResponseDto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Channel } from '../../database/entities';
import { EntityRepository } from '@mikro-orm/postgresql';

@WebSocketGateway({
  namespace: '/api',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly orm: MikroORM,
    private readonly chatService: ChatService,
    @InjectRepository(Channel)
    private readonly channelRepository: EntityRepository<Channel>,
  ) {}

  @SubscribeMessage('message:send')
  @UseRequestContext()
  async handleEvent(
    client: Socket,
    data: SendMessageEventRequestDto,
  ): Promise<WsResponse<SendMessageEventResponseDto>> {
    const event = 'message:send';
    const newMessage = await this.chatService.saveMessage(
      data.channelId,
      data.content,
    );
    if (!newMessage) {
      throw new WsException('Could not find channel');
    }
    const receivedMessageEventResponseDto: ReceivedMessageEventDto = {
      channelId: data.channelId,
      content: data.content,
      createdAt: newMessage.createdAt,
    };
    client
      .to(data.channelId)
      .emit('message:received', receivedMessageEventResponseDto);
    return { event, data: { ...data, createdAt: newMessage.createdAt } };
  }

  async handleActiveClientsOnNewChannelCreated(newChannel: ChannelDto) {
    const sockets = await this.server.fetchSockets();
    sockets.forEach((socket) => {
      socket.join(newChannel.id);
    });
    const channelCreatedEventResponseDto: ChannelCreatedEventResponseDto = {
      channelId: newChannel.id,
    };
    this.server.emit('channel:created', channelCreatedEventResponseDto);
  }

  @UseRequestContext()
  async handleConnection(client: Socket) {
    const channels = await this.channelRepository.findAll();
    client.join(channels.map((channel) => channel.id));
    client.emit('channels:joined');
  }
}
