import { MessageDto } from './MessageDto';

export type SendMessageEventResponseDto = Omit<MessageDto, 'id'>;
