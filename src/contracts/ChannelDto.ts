import { MessageDto } from './MessageDto';

export class ChannelDto {
  id: string;
  title: string;
  description: string;
  messages: MessageDto[];
}
