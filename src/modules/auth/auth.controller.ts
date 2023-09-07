import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  UnprocessableEntityException,
  HttpCode,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginResponseDto, SignUpRequestDto, UserDto } from '../../contracts';
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('/login')
  async login(@Request() req): Promise<LoginResponseDto> {
    const loginResponse = await this.authService.login(req.user);
    return loginResponse;
  }

  @Public()
  @Post('/signup')
  async signUp(@Body() signUpRequestDto: SignUpRequestDto): Promise<UserDto> {
    const newUser = await this.authService.createNewUser(signUpRequestDto);
    if (newUser === null) {
      throw new UnprocessableEntityException(
        'Something went wrong creating the user',
      );
    }
    return newUser;
  }

  @Get('/me')
  async getAuthenticatedUser(@Request() req): Promise<UserDto> {
    const loggedInUser = await this.authService.getUserById(req.user.id);
    if (loggedInUser === null) {
      throw new NotFoundException('Could not get user');
    }
    return loggedInUser;
  }
}
