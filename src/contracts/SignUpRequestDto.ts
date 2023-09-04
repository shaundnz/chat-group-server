import { IsNotEmpty, IsString } from 'class-validator';
import { IsUniqueUsername, Match } from './validators';

export class SignUpRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsUniqueUsername()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match(SignUpRequestDto, (s) => s.password)
  confirmPassword: string;
}
