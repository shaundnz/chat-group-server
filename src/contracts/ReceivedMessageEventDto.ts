import { MessageDto } from './MessageDto';

export type ReceivedMessageEventDto = Omit<MessageDto, 'id'>;
