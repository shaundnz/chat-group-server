import { Test } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { NotFoundException } from '@nestjs/common';
import { User } from '../../../database/entities';
import { SignUpRequestDto } from 'src/contracts';

type TestUserEntity = Omit<User, 'createdAt' | 'updatedAt' | 'messages'>;

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

    getUserById: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockUserEntity)),

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

  it('should create a new user', async () => {
    const signUpRequestDto = {
      username: 'usertwo',
      password: 'password',
      confirmPassword: 'password',
    };
    const res = await authController.signUp(signUpRequestDto);
    expect(res.username).toBe(signUpRequestDto.username);
  });

  it('should get the logged in user', async () => {
    const user = await authController.getAuthenticatedUser({
      user: { id: '1', username: 'userOne' },
    });
    expect(user).toBe(mockUserEntity);
  });

  it('should throw a NotFoundException if the user does not exist', async () => {
    mockAuthService.getUserById.mockImplementationOnce(() =>
      Promise.resolve(null),
    );

    await expect(
      authController.getAuthenticatedUser({
        user: { id: '2', username: 'userTwo' },
      }),
    ).rejects.toThrowError(NotFoundException);
  });
});
