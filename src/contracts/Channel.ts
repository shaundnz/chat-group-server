export class ChannelDto {
  id: string;
  title: string;
  description: string;
  messages: string[];
}

export class CreateChannelDto {
  title: string;
  description: string;
}
