import * as request from 'supertest';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthTestDatabaseSeeder } from '../src/database/seeders';
import { LoginRequestDto, SignUpRequestDto } from 'src/contracts';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup';

describe('auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    setupApp(app);

    const seeder = app.get(MikroORM).getSeeder();
    await app.get(MikroORM).getSchemaGenerator().refreshDatabase();
    await seeder.seed(AuthTestDatabaseSeeder);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login gets access token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'userOne',
        password: 'Password1!',
      })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
  });

  it.each([
    {
      username: 'userone',
      password: 'Password1!',
    },
    {
      username: 'userOne',
      password: 'password1!',
    },
  ])(
    'POST /auth/login returns 401 for incorrect credentials',
    async (loginRequestDto: LoginRequestDto) => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginRequestDto)
        .expect(401);
    },
  );

  it('POST /auth/signup creates a user', async () => {
    const signUpRequestDto: SignUpRequestDto = {
      username: 'userTwo',
      password: 'abc123',
      confirmPassword: 'abc123',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(signUpRequestDto)
      .expect(201);

    expect(res.body.username).toBe(signUpRequestDto.username);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'userTwo', password: 'abc123' })
      .expect(200);
  });

  it('POST /auth/signup returns 400 if the user already exists', async () => {
    const signUpRequestDto: SignUpRequestDto = {
      username: 'userOne',
      password: 'abc123',
      confirmPassword: 'abc123',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(signUpRequestDto)
      .expect(400);

    expect(res.body.message).toEqual([
      { error: 'Username "userOne" already exists', property: 'username' },
    ]);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'userOne', password: 'abc123' })
      .expect(401);
  });

  it('POST /auth/signup returns 400 if the passwords do not match', async () => {
    const signUpRequestDto: SignUpRequestDto = {
      username: 'userThree',
      password: 'abc123',
      confirmPassword: 'abc1234',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(signUpRequestDto)
      .expect(400);

    expect(res.body.message).toEqual([
      {
        error: 'password and confirmPassword does not match',
        property: 'confirmPassword',
      },
    ]);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'userThree', password: 'abc123' })
      .expect(401);
  });

  it('GET /auth/me gets the authenticated user', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'userOne',
        password: 'Password1!',
      })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .expect(200);

    expect(res.body.username).toBe('userOne');
  });

  it('GET /auth/me returns 401 for an unauthenticated user', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
