import { PrismaService } from '../../src/prisma.services';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import * as request from 'supertest';
import { userResponse } from '../../test/services/user-service.spec';
import { faker } from '@faker-js/faker';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
describe('UserController(e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const response = {
    name: 'Lood backead',
    email: faker.internet.email(),
    created_at: new Date(),
    updated_at: new Date(),
    email_confirmed: false,
    is_admin: true,
    isDeleted: false,
  };

  const update: UpdateUserDto = {
    id: 13,
    name: 'John Doe',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    await prisma.user.create({
      data: response,
    });
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('should create a user', async () => {
    const userData: CreateUserDto = {
      name: 'Sabi Call',
      email: faker.internet.email(),
      password: 'Password12345',
    };
    const { status, body } = await request(app.getHttpServer()).post('/user').send(userData);
    expect(status).toBe(201);
    expect(body).toStrictEqual(userResponse);
  });

  it('Fetch all Users', async () => {
    const { status, body } = await request(app.getHttpServer()).get('/user').set(
      'Authorization',
      // eslint-disable-next-line max-len
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJmcmVuY2hAZXhhbXBsZS5jb20iLCJpc19hZG1pbiI6dHJ1ZSwiZW1haWxfY29uZmlybWVkIjpmYWxzZSwiaWF0IjoxNjYyNjQ5MTkxLCJleHAiOjE2OTQxODUxOTF9.ucsQ4Oc5UK_T1OCtxRvOCSU9TrxDczr2OG79E2hL5Ok',
    );
    expect(status).toBe(200);
  });

  it('Fetch a User', async () => {
    const { status, body } = await request(app.getHttpServer()).get('/user/2').set(
      'Authorization',
      // eslint-disable-next-line max-len
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJmcmVuY2hAZXhhbXBsZS5jb20iLCJpc19hZG1pbiI6dHJ1ZSwiZW1haWxfY29uZmlybWVkIjpmYWxzZSwiaWF0IjoxNjYyNjQ5MTkxLCJleHAiOjE2OTQxODUxOTF9.ucsQ4Oc5UK_T1OCtxRvOCSU9TrxDczr2OG79E2hL5Ok',
    );
    expect(status).toBe(200);
  });

  it('Patch a user detail', async () => {
    const { status, body } = await request(app.getHttpServer()).patch('/user').send(update).set(
      'Authorization',
      // eslint-disable-next-line max-len
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJmcmVuY2hAZXhhbXBsZS5jb20iLCJpc19hZG1pbiI6dHJ1ZSwiZW1haWxfY29uZmlybWVkIjpmYWxzZSwiaWF0IjoxNjYyNjQ5MTkxLCJleHAiOjE2OTQxODUxOTF9.ucsQ4Oc5UK_T1OCtxRvOCSU9TrxDczr2OG79E2hL5Ok',
    );
    expect(status).toBe(200);
  });

  it('Get User token', async () => {
    const userDetails = {
      email: 'french@example.com',
      password: 'password12345',
    };
    const { status, body } = await request(app.getHttpServer()).post('/user/token').send(userDetails);
    expect(status).toBe(201);
  });

  it('Get User token', async () => {
    const userDetails = {
      email: 'four@example.com',
      password: 'password12345',
    };
    const { status, body } = await request(app.getHttpServer()).post('/user/token').send(userDetails);
    expect(status).toBe(404);
  });

  it('Authenticate user', async () => {
    const userDetails = {
      email: 'french@example.com',
      password: 'password12345',
    };
    const { status, body } = await request(app.getHttpServer()).post('/user/authenticate').send(userDetails);
    expect(status).toBe(201);
  });
});
