import { PrismaService } from '../../src/prisma.services';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import * as request from 'supertest';
import { userResponse } from '../../test/services/user-service.spec';
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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

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
