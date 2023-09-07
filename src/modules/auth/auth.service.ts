import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/sqlite';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities/User';
import { LoginResponseDto, SignUpRequestDto, UserDto } from '../../contracts';
import { UserMapper } from '../../mappers';
import { compare, hash } from 'bcrypt';
import { JwtClaims } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserDto | null> {
    const user = await this.userRepository.findOne({ username: username });
    if (user === null) {
      return null;
    }

    const passwordCompare = await compare(password, user.password);

    if (!passwordCompare) {
      return null;
    }

    return UserMapper.EntityToDto(user);
  }

  async getUser(username: string): Promise<UserDto | null> {
    const user = await this.userRepository.findOne({ username: username });
    if (user === null) {
      return null;
    }
    return UserMapper.EntityToDto(user);
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({ id: id });
    if (user === null) {
      return null;
    }
    return UserMapper.EntityToDto(user);
  }

  async createNewUser(signUpRequestDto: SignUpRequestDto) {
    const { username, password } = signUpRequestDto;

    const user = await this.getUser(username);
    if (user !== null) {
      return null;
    }

    const hashedPassword = await hash(password, 5);
    const newUser = this.userRepository.create(
      new User(username, hashedPassword),
    );
    await this.em.persistAndFlush(newUser);

    return UserMapper.EntityToDto(newUser);
  }

  async login(userDto: UserDto): Promise<LoginResponseDto> {
    const { id, username } = userDto;
    const payload: JwtClaims = { username: username, sub: id };
    return {
      accessToken: this.jwtService.sign(payload),
      user: userDto,
    };
  }
}
