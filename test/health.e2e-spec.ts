import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup';

describe('health-check', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    setupApp(app);

    await app.init();
  });

  it('GET /health-check is publicly accessible', async () => {
    await request(app.getHttpServer()).get('/health-check').expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
