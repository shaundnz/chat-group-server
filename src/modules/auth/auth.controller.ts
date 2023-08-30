import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  BadRequestException,
  UnprocessableEntityException,
  HttpCode,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginResponseDto, SignUpRequestDto, UserDto } from '../../contracts';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('/login')
  async login(@Request() req): Promise<LoginResponseDto> {
    return await this.authService.login(req.user);
  }

  @Public()
  @Post('/signup')
  async signUp(@Body() signUpRequestDto: SignUpRequestDto): Promise<UserDto> {
    const { username, password, confirmPassword } = signUpRequestDto;
    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }
    const user = await this.authService.getUser(username);
    if (user !== null) {
      throw new BadRequestException(
        `User with username "${username}" already exists`,
      );
    }
    const newUser = await this.authService.createNewUser(signUpRequestDto);
    if (newUser === null) {
      throw new UnprocessableEntityException(
        'Something went wrong creating the user',
      );
    }
    return newUser;
  }
}
