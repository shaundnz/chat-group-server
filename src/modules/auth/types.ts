import { Socket } from 'socket.io';

export class JwtClaims {
  sub: string;
  username: string;
}

export class SocketWithJwtUser extends Socket {
  user: JwtClaims;
}
