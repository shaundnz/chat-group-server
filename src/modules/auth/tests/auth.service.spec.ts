import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { User } from '../../../database/entities';
import { compare, hash } from 'bcrypt';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { JwtService } from '@nestjs/jwt';
import { SignUpRequestDto } from 'src/contracts';

jest.mock('../../../mappers', () => ({
  UserMapper: {
    EntityToDto: jest.fn().mockImplementation((user) => user),
  },
}));

type TestUserEntity = Omit<User, 'createdAt' | 'updatedAt'>;

describe('AuthService', () => {
  let authService: AuthService;

  const mockUserEntities: TestUserEntity[] = [
    {
      id: '1',
      username: 'userone',
      password: 'Password1!',
    },
  ];

  const mockEntityManager = {
    persistAndFlush: jest.fn().mockImplementation(() => {
      return Promise.resolve();
    }),
  };

  const mockUserRepository = {
    findOne: jest
      .fn()
      .mockImplementation(({ username }: { username: string }) => {
        return Promise.resolve(
          mockUserEntities.find((user) => user.username === username),
        );
      }),

    create: jest
      .fn()
      .mockImplementation((signUpRequestDto: SignUpRequestDto) => ({
        id: '2',
        username: signUpRequestDto.username,
      })),
  };

  beforeAll(async () => {
    const userPasswordHash = await hash(mockUserEntities[0].password, 1);
    mockUserEntities[0].password = userPasswordHash;
  });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: jest.fn(),
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should return null when validating a user that does not exist', async () => {
    mockUserRepository.findOne.mockImplementationOnce(() =>
      Promise.resolve(null),
    );
    const user = await authService.validateUser('usertwo', 'Password1!');
    expect(user).toBeNull();
  });

  it('should return null when validating a user with a incorrect password', async () => {
    const user = await authService.validateUser(
      mockUserEntities[0].username,
      'wrongpassword',
    );
    expect(user).toBeNull();
  });

  it('should return a user when validating a user with correct credentials', async () => {
    const user = await authService.validateUser(
      mockUserEntities[0].username,
      'Password1!',
    );
    expect(user).toBe(mockUserEntities[0]);
  });

  it('should create a new user with a hashed password', async () => {
    mockUserRepository.findOne.mockImplementationOnce(() =>
      Promise.resolve(null),
    );
    const signUpRequestDto = {
      username: 'usertwo',
      password: 'password',
      confirmPassword: 'password',
    };
    const newUser = await authService.createNewUser(signUpRequestDto);
    expect(newUser).not.toBeNull();
    expect(newUser?.username).toBe(signUpRequestDto.username);
    const storedPassword = mockUserRepository.create.mock.calls[0][0].password;
    expect(storedPassword).not.toBe(signUpRequestDto.password);
    expect(
      await compare(signUpRequestDto.password, storedPassword),
    ).toBeTruthy();
  });

  it('should return null if a user with the username already exists', async () => {
    const signUpRequestDto = {
      username: 'userone',
      password: 'password',
      confirmPassword: 'password',
    };
    const newUser = await authService.createNewUser(signUpRequestDto);
    expect(newUser).toBeNull();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();
  });
});
