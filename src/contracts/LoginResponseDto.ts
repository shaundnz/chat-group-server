import { UserDto } from './UserDto';

export class LoginResponseDto {
  accessToken: string;
  user: UserDto;
}
