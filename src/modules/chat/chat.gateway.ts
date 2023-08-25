import {
  SubscribeMessage,
  OnGatewayConnection,
  WebSocketGateway,
  WsResponse,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChannelsService } from '../channels/channels.service';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { MessageDto } from '../../contracts';

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
  ) {}

  @SubscribeMessage('message:send')
  handleEvent(
    client: Socket,
    data: Omit<MessageDto, 'id'>,
  ): WsResponse<unknown> {
    const event = 'message:send';
    client.to(data.channelId).emit('message:received', {
      channelId: data.channelId,
      message: data.content,
    });
    return { event, data };
  }

  @UseRequestContext()
  async handleConnection(client: Socket) {
    const channels = await this.channelsService.getChannels();
    client.join(channels.map((channel) => channel.id));
    client.emit('channels:joined');
  }
}
