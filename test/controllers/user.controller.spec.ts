import { Test, TestingModule } from '@nestjs/testing';
import { JwtTokenUser } from '../../src/common/types/jwtTokenUser';
import { UserService } from '../../src/user/user.service';
import { UserController } from './../../src/user/user.controller';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import mockedJwtService from '../__mocks__/jwt.service';
import { HttpStatus } from '@nestjs/common';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { AuthenticateUserDto } from '../../src/user/dto/authenticate-user.dto';
describe('User controller', () => {
  let controller: UserController;
  let service: UserService;
  const data = {};
  const tokenPayload: JwtTokenUser = {
    id: 1,
    username: 'johndoe@example.com',
    is_admin: true,
    email_confirmed: false,
    iat: 1647920317,
    exp: 1679456317,
  };
  const response = {
    id: 13,
    name: 'Kampala George',
    email: 'kampala@fake-mail.com',
    email_confirmed: false,
    is_admin: false,
    created_at: '2022-03-21T20:56:04.622Z',
    updated_at: '2022-03-21T20:56:04.622Z',
    credentials_id: 13,
    isDeleted: false,
  };

  const userDetails = {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'password12345',
    created_at: new Date('2022-09-07T22:54:07.042Z'),
    updated_at: new Date('2022-09-07T22:54:07.042Z'),
    email_confirmed: false,
    is_admin: true,
    isDeleted: false,
    credentials_id: 1,
  };

  const createUserResponse = {
    status: HttpStatus.CREATED,
    data: { message: 'User successfully created' },
  };

  const req: Request = {
    user: tokenPayload,
  } as Request;

  const update: UpdateUserDto = {
    id: 13,
    name: 'John Doe',
  };
  const token =
    // eslint-disable-next-line max-len
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJqb2huZG9lQGV4YW1wbGUuY29tIiwiaXNfYWRtaW4iOnRydWUsImVtYWlsX2NvbmZpcm1lZCI6ZmFsc2UsImlhdCI6MTY0NzkyMDMxNywiZXhwIjoxNjc5NDU2MzE3fQ.ECfRDxtlnYPoJ-PUo8fqvIncDjAC1iNAG5oScCK5nXo';
  const deletedResponse = {
    users: {
      name: 'deleted',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            find: jest.fn().mockResolvedValue([response]),
            findOne: jest.fn().mockResolvedValue(response),
            findUnique: jest.fn().mockResolvedValue(data),
            create: jest.fn().mockResolvedValue(createUserResponse),
            update: jest.fn().mockResolvedValue(response),
            updateById: jest.fn().mockResolvedValue(data),
            delete: jest.fn().mockResolvedValue(deletedResponse),
            validateToken: jest.fn().mockResolvedValue(true),
            authenticate: jest.fn().mockResolvedValue(userDetails),
            authenticateAndGetJwtToken: jest.fn().mockResolvedValue({ token }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: mockedJwtService.sign,
            decode: mockedJwtService.decode,
          },
        },
      ],
    }).compile();
    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });
  describe('Fetch all users', () => {
    it('should fetch all users', () => {
      expect(controller.find({}, req)).resolves.toEqual([response]);
    });
  });

  describe('Fetch one user', () => {
    it('should fetch one user', () => {
      expect(controller.findUnique(2, req)).resolves.toEqual(data);
    });
  });

  describe('Create User', () => {
    it('should create a user', () => {
      expect(controller.create(userDetails)).resolves.toEqual(createUserResponse);
    });
  });

  describe('Update User', () => {
    it('should create a user', () => {
      const request: Request = {
        user: response,
      } as unknown as Request;
      expect(controller.update(update, request)).resolves.toEqual(response);
    });
  });

  describe('Delete a user', () => {
    it('should create a user', () => {
      const request: Request = {
        user: response,
      } as unknown as Request;
      expect(controller.delete({ id: 13 }, request)).resolves.toEqual(deletedResponse);
    });
  });

  describe('validate Token', () => {
    it('should create a user', () => {
      const request: Request = {
        headers: token,
      } as unknown as Request;
      expect(controller.userValidateToken(request)).toBeTruthy();
    });
  });

  describe('validate Token', () => {
    it('should create a user', () => {
      const authenticateUserDto: AuthenticateUserDto = {
        email: 'johndoe@example.com',
        password: 'password12345',
      };
      expect(controller.userAuthenticate(authenticateUserDto)).toBeTruthy();
    });
  });

  describe('validate Token', () => {
    it('should create a user', () => {
      const authenticateUserDto: AuthenticateUserDto = {
        email: 'johndoe@example.com',
        password: 'password12345',
      };
      expect(controller.userGetToken(authenticateUserDto)).resolves.toEqual({ token });
    });
  });
});
