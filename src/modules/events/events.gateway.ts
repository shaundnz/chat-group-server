import {
  MessageBody,
  SubscribeMessage,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  ConnectedSocket,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  handleEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): WsResponse<unknown> {
    const event = 'events';
    client.to('welcome').emit('update', { room: 'welcome', message: data });
    return { event, data };
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }

  handleConnection(client: Socket) {
    console.log('Joined');
    client.join('welcome');
  }
}
