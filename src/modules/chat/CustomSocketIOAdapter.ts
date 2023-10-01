import { INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { JwtClaims, SocketWithJwtUser } from '../auth/types';

export class CustomSocketIOAdapter extends IoAdapter {
  constructor(private app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const jwtService = this.app.get(JwtService);
    const server: Server = super.createIOServer(port, options);

    server.of('api').use(createTokenMiddleware(jwtService));

    return server;
  }
}

const createTokenMiddleware =
  (jwtService: JwtService) => (socket: SocketWithJwtUser, next) => {
    try {
      const token = socket.handshake.auth.token;

      const payload: JwtClaims = jwtService.verify(token);
      socket.user = payload;
      next();
    } catch {
      next(new Error('FORBIDDEN'));
    }
  };
