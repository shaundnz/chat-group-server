import { Test } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { BadRequestException } from '@nestjs/common';
import { User } from '../../../database/entities';
import { SignUpRequestDto } from 'src/contracts';

type TestUserEntity = Omit<User, 'createdAt' | 'updatedAt'>;

describe('AuthController', () => {
  let authController: AuthController;

  const mockUserEntity: TestUserEntity = {
    id: '1',
    username: 'userone',
    password: 'Password1!',
  };

  const mockAuthService = {
    validateUser: jest.fn().mockImplementation(() => Promise.resolve(true)),
    getUser: jest.fn().mockImplementation(() => Promise.resolve(null)),
    createNewUser: jest
      .fn()
      .mockImplementation((signUpRequestDto: SignUpRequestDto) =>
        Promise.resolve({ id: '2', username: signUpRequestDto.username }),
      ),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should throw a BadRequestException if password and confirm password do not match', async () => {
    const signUpRequestDto = {
      username: 'usertwo',
      password: 'password',
      confirmPassword: 'passwordd',
    };
    await expect(authController.signUp(signUpRequestDto)).rejects.toThrowError(
      BadRequestException,
    );
  });

  it('should throw a BadRequestException if the user already exists in the database', async () => {
    const signUpRequestDto = {
      username: 'userone',
      password: 'password',
      confirmPassword: 'password',
    };
    mockAuthService.getUser.mockImplementationOnce(() =>
      Promise.resolve(mockUserEntity),
    );
    await expect(authController.signUp(signUpRequestDto)).rejects.toThrowError(
      BadRequestException,
    );
  });

  it('should return 201 if the user is successfully created', async () => {
    const signUpRequestDto = {
      username: 'usertwo',
      password: 'password',
      confirmPassword: 'password',
    };
    const res = await authController.signUp(signUpRequestDto);
    expect(res.username).toBe(signUpRequestDto.username);
  });
});
