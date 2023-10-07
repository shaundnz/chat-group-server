import { UserDto } from './UserDto';

export class MessageDto {
  id: string;
  createdAt: string;
  channelId: string;
  content: string;
  user: UserDto;
}
