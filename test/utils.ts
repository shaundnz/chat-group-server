import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { LoginRequestDto, SignUpRequestDto } from '../src/contracts';

export const createUser = async (
  app: INestApplication,
  signUpRequestDto: SignUpRequestDto,
) => {
  await request(app.getHttpServer())
    .post('/auth/signup')
    .send(signUpRequestDto)
    .expect(201);
};

export const getAccessToken = async (
  app: INestApplication,
  loginRequestDto: LoginRequestDto,
) => {
  const loggedInUser = await request(app.getHttpServer())
    .post('/auth/login')
    .send(loginRequestDto)
    .expect(200);

  return loggedInUser.body.accessToken;
};
