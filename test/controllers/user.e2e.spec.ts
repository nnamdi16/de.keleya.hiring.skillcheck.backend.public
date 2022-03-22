import { PrismaService } from '../../src/prisma.services';
import { useContainer } from 'class-validator';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import * as request from 'supertest';
import { userDetails, userResponse } from '../../test/services/user-service.spec';
import { User } from '@prisma/client';
describe('UserController(e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const response = {
    name: 'John Doe',
    email: 'sabi@gmail.com',
    created_at: new Date(),
    updated_at: new Date(),
    email_confirmed: false,
    is_admin: true,
    isDeleted: false,
  };
  //   const data = expect.objectContaining({
  //     id: expect.any(Number),
  //     name: expect.any(String),
  //     email: expect.any(String),
  //     email_confirmed: expect.any(Boolean),
  //     is_admin: expect.any(Boolean),
  //     created_at: expect.any(Date),
  //     updated_at: expect.any(Date),
  //     credentials_id: expect.any(Number),
  //     isDeleted: expect.any(Boolean),
  //     credentials: expect.any(String),
  //   });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    // useContainer(app.select(AppModule), { fallbackOnErrors: true });
    // app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    await prisma.user.create({
      data: response,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('should create a user', async () => {
    const userData: CreateUserDto = {
      name: 'Sabi Call',
      email: 'sabi@gmail.com',
      password: 'Password12345',
    };
    const { status, body } = await request(app.getHttpServer()).post('/user').send(userData);
    expect(status).toBe(201);
    expect(body).toStrictEqual(userResponse);
  });
});
