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
import { ChannelsService } from '../channels/channels.service';
import { ChatService } from './chat.service';
import {
  ReceivedMessageEventDto,
  SendMessageEventRequestDto,
  SendMessageEventResponseDto,
} from '../../contracts';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly orm: MikroORM,
    private readonly channelsService: ChannelsService,
    private readonly chatService: ChatService,
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

  @UseRequestContext()
  async handleConnection(client: Socket) {
    const channels = await this.channelsService.getChannels();
    client.join(channels.map((channel) => channel.id));
    client.emit('channels:joined');
  }
}
