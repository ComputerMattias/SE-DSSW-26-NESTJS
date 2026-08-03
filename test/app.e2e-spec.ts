import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { rmSync } from 'node:fs';
import { AppModule } from '../src/app.module';

const TEST_DATA_FILE = './test/tmp-e2e-store.json';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DATA_FILE_PATH = TEST_DATA_FILE;
    process.env.JWT_SECRET = 'test_secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    rmSync(TEST_DATA_FILE, { force: true });
  });

  it('rejects login with wrong credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'operator', password: 'wrong' })
      .expect(401);
  });

  it('rejects protected routes without a token', () => {
    return request(app.getHttpServer()).get('/candidates').expect(401);
  });

  it('logs in and creates a candidate', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'operator', password: 'operator123' })
      .expect(201);

    const token = login.body.access_token;
    expect(typeof token).toBe('string');

    const created = await request(app.getHttpServer())
      .post('/candidates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        identifier: 'patient-e2e',
        dateOfBirth: '1970-01-01',
        gender: 'F',
        height: 170,
        status: 'H',
      })
      .expect(201);

    expect(created.body.pseudoName).toMatch(/^P-[0-9a-f]{8}$/);
    // the real identifier must never be returned to the client
    expect(JSON.stringify(created.body)).not.toContain('patient-e2e');

    await request(app.getHttpServer())
      .get('/candidates')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
      });
  });
});
