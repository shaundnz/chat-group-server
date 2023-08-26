import {
  SubscribeMessage,
  OnGatewayConnection,
  WebSocketGateway,
  WsResponse,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { ChannelsService } from '../channels/channels.service';
import { ChatService } from './chat.service';
import { SendMessageEventDto } from '../../contracts/SendMessageEventDto';

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
    data: SendMessageEventDto,
  ): Promise<WsResponse<SendMessageEventDto>> {
    const event = 'message:send';
    client.to(data.channelId).emit('message:received', {
      channelId: data.channelId,
      message: data.content,
    });
    await this.chatService.saveMessage(data.channelId, data.content);
    return { event, data };
  }

  @UseRequestContext()
  async handleConnection(client: Socket) {
    const channels = await this.channelsService.getChannels();
    client.join(channels.map((channel) => channel.id));
    client.emit('channels:joined');
  }
}
