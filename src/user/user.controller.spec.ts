import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Request } from 'express';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { tokenPayload, userDetails } from '../../test/services/user-service.spec';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { PrismaService } from '../prisma.services';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      imports: [
        PassportModule,
        JwtModule.register({
          secret: 'JWT_SECRET',
          signOptions: {
            expiresIn: '1year',
            algorithm: 'HS256',
          },
        }),
      ],
      providers: [
        {
          provide: UserService,
          useValue: {
            find: jest.fn().mockResolvedValue([userDetails]),
            findOne: jest.fn().mockImplementation(() => Promise.resolve(userDetails)),
          },
        },
        PrismaService,
        JwtStrategy,
        ConfigService,
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('find Users', () => {
    it('should fetch all users', async () =>
      expect(userController.find({}, tokenPayload as Request)).resolves.toEqual([userDetails]));
  });
});
