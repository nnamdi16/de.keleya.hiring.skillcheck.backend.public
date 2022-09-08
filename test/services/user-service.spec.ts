import { EmailOrPasswordNotFoundException } from './../../src/common/exception-filters/EmailOrPasswordNotFound';
import { UserNotFoundException } from './../../src/common/exception-filters/UserNotFoundException';
import { UserAlreadyExistsException } from './../../src/common/exception-filters/UserAlreadyExistsException';
import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserService } from '../../src/user/user.service';
import { prismaMock } from '../../singleton';
import { JwtService } from '@nestjs/jwt';
import mockedJwtService from '../__mocks__/jwt.service';
import { PrismaService } from '../../src/prisma.services';
import { ConfigService } from '@nestjs/config';
import mockedConfigService from '../__mocks__/config.service';
import { JwtTokenUser } from '../../src/common/types/jwtTokenUser';
import { UpdateUserDto } from '../../src/user/dto/update-user.dto';
import { AuthenticateUserDto } from '../../src/user/dto/authenticate-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

export const tokenPayload: JwtTokenUser = {
  id: 1,
  username: 'johndoe@example.com',
  is_admin: true,
  email_confirmed: false,
  iat: 1647920317,
  exp: 1679456317,
};

export const nonAdminTokenPayload: JwtTokenUser = {
  id: 1,
  username: 'johndoe@example.com',
  is_admin: false,
  email_confirmed: false,
  iat: 1647920317,
  exp: 1679456317,
};

const authenticateUserDto: AuthenticateUserDto = {
  email: 'johndoe@example.com',
  password: 'password12345',
};

export const userDetails = {
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

export const nonAdminUserDetails = {
  id: 1,
  name: 'John Doe',
  email: 'johndoe@example.com',
  password: 'password12345',
  created_at: new Date(),
  updated_at: new Date(),
  email_confirmed: false,
  is_admin: false,
  isDeleted: false,
  credentials_id: 2,
};

const tokenResult = {
  token:
    // eslint-disable-next-line max-len
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJqb2huZG9lQGV4YW1wbGUuY29tIiwiaXNfYWRtaW4iOnRydWUsImVtYWlsX2NvbmZpcm1lZCI6ZmFsc2UsImlhdCI6MTY0NzkyMDMxNywiZXhwIjoxNjc5NDU2MzE3fQ.ECfRDxtlnYPoJ-PUo8fqvIncDjAC1iNAG5oScCK5nXo',
};
export const userResponse = {
  status: 201,
  data: {
    message: 'User successfully created',
  },
};

describe('UserService', () => {
  let userService: UserService;
  let bcryptCompare: jest.Mock;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: JwtService,
          useValue: {
            sign: mockedJwtService.sign,
            decode: mockedJwtService.decode,
          },
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    bcryptCompare = jest.fn().mockReturnValue(true);
    (bcrypt.compare as jest.Mock) = bcryptCompare;

    // reset call counts and called with arguments after each spec
  });

  afterEach(() => jest.clearAllMocks());
  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  test('should create new user ', async () => {
    prismaMock.user.create.mockResolvedValue(userDetails);

    await expect(userService.create(userDetails)).resolves.toEqual(userResponse);
  });

  test('should return user already exist for existing user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userDetails);
    prismaMock.user.create.mockResolvedValue(userDetails);

    await expect(userService.create(userDetails)).rejects.toEqual(new UserAlreadyExistsException());
  });

  test("Admin should update a user's name if user  ", async () => {
    const result = {
      id: 1,
      name: 'Fahrn Pally',
      email: 'johndoe@example.com',
      password: 'password12345',
      created_at: new Date('2022-09-07T22:54:07.042Z'),
      updated_at: new Date('2022-09-07T22:54:07.042Z'),
      email_confirmed: false,
      is_admin: true,
      isDeleted: false,
      credentials_id: 1,
    };
    const update: UpdateUserDto = {
      id: 1,
      name: 'Fahrn Pally',
    };

    prismaMock.user.update.mockResolvedValue(result);

    await expect(userService.update(tokenPayload, update)).resolves.toEqual(result);
  });

  test("Non admin should throw when user detail id not the same as it's  id ", async () => {
    const result = {
      id: 1,
      name: 'Fahrn Pally',
      email: 'johndoe@example.com',
      password: 'password12345',
      created_at: new Date(),
      updated_at: new Date(),
      email_confirmed: false,
      is_admin: false,
      isDeleted: false,
      credentials_id: 1,
    };
    const update: UpdateUserDto = {
      id: 1,
      name: 'Fahrn Pally',
    };
    const data = {
      id: 2,
      username: 'johndoe@example.com',
      is_admin: false,
      email_confirmed: false,
      iat: 1647920317,
      exp: 1679456317,
    };

    prismaMock.user.update.mockResolvedValue(result);

    await expect(userService.update(data, update)).rejects.toEqual(new UserNotFoundException());
  });

  test("should update a user's name ", async () => {
    const result = {
      id: 1,
      name: 'Fahrn Pally',
      email: 'johndoe@example.com',
      password: 'password12345',
      created_at: new Date(),
      updated_at: new Date(),
      email_confirmed: false,
      is_admin: true,
      isDeleted: true,
      credentials_id: 1,
    };
    const update: UpdateUserDto = {
      id: 1,
      name: 'Fahrn Pally',
    };
    const data = {
      id: 1,
      username: 'johndoe@example.com',
      is_admin: false,
      email_confirmed: false,
      iat: 1647920317,
      exp: 1679456317,
    };
    prismaMock.user.findUnique.mockResolvedValue(result);
    prismaMock.user.update.mockResolvedValue(result);

    await expect(userService.update(data, update)).rejects.toEqual(new UserNotFoundException());
  });

  test("Admin should update a user's name if user  ", async () => {
    const result = {
      id: 1,
      name: 'Fahrn Pally',
      email: 'johndoe@example.com',
      password: 'password12345',
      created_at: new Date('2022-09-07T22:54:07.042Z'),
      updated_at: new Date('2022-09-07T22:54:07.042Z'),
      email_confirmed: false,
      is_admin: false,
      isDeleted: false,
      credentials_id: 1,
    };
    const update: UpdateUserDto = {
      id: 1,
      name: 'Fahrn Pally',
    };
    prismaMock.user.findUnique.mockResolvedValue(result);
    prismaMock.user.update.mockResolvedValue(result);

    await expect(userService.update(nonAdminTokenPayload, update)).resolves.toEqual(result);
  });

  test('should find all users ', async () => {
    prismaMock.user.findMany.mockResolvedValue([userDetails]);
    await expect(userService.find(tokenPayload, {})).resolves.toEqual([userDetails]);
  });

  test('should return only the user details for non admin ', async () => {
    prismaMock.user.findMany.mockResolvedValue([nonAdminUserDetails]);
    await expect(userService.find(nonAdminTokenPayload, {})).resolves.toEqual([nonAdminUserDetails]);
  });

  test('should find one user ', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userDetails);
    await expect(userService.findUnique({ id: 1 }, false, tokenPayload)).resolves.toEqual(userDetails);
  });

  test('should throw error when the user is not an admin ', async () => {
    prismaMock.user.findUnique.mockRejectedValue(new UnauthorizedException());
    await expect(userService.findUnique({ id: 2 }, false, nonAdminTokenPayload)).rejects.toEqual(
      new UnauthorizedException(),
    );
  });

  test('should delete one user ', async () => {
    const updateUser = {
      id: 1,
      name: 'Fahrn Pally',
      email: 'johndoe@example.com',
      password: 'password12345',
      created_at: new Date(),
      updated_at: new Date(),
      email_confirmed: false,
      is_admin: true,
      isDeleted: true,
      credentials_id: 1,
    };
    const result = {
      users: {
        name: 'deleted',
      },
    };
    prismaMock.user.update.mockResolvedValue(updateUser);
    prismaMock.user.delete.mockResolvedValue(userDetails);

    await expect(userService.delete(tokenPayload, { id: 1 })).resolves.toEqual(result);
  });

  test('should delete one user ', async () => {
    await expect(userService.delete(nonAdminTokenPayload, { id: 1 })).rejects.toEqual(new UserNotFoundException());
  });

  test('Authenticate and get a user token ', async () => {
    const result = {
      token:
        // eslint-disable-next-line max-len
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJqb2huZG9lQGV4YW1wbGUuY29tIiwiaXNfYWRtaW4iOnRydWUsImVtYWlsX2NvbmZpcm1lZCI6ZmFsc2UsImlhdCI6MTY0NzkyMDMxNywiZXhwIjoxNjc5NDU2MzE3fQ.ECfRDxtlnYPoJ-PUo8fqvIncDjAC1iNAG5oScCK5nXo',
    };

    prismaMock.user.findUnique.mockResolvedValue(userDetails);
    bcryptCompare.mockReturnValue(true);
    await userService.generateToken(tokenPayload);

    await expect(userService.authenticateAndGetJwtToken(authenticateUserDto)).resolves.toEqual(result);
  });

  test('Authenticate and get a user token ', async () => {
    bcryptCompare.mockReturnValue(true);
    await userService.generateToken(tokenPayload);

    await expect(userService.authenticateAndGetJwtToken(authenticateUserDto)).rejects.toEqual(
      new UserNotFoundException(),
    );
  });

  test('Authenticate and get a user token ', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userDetails);
    bcryptCompare.mockReturnValue(false);
    await userService.generateToken(tokenPayload);

    await expect(userService.authenticateAndGetJwtToken(authenticateUserDto)).rejects.toEqual(
      new EmailOrPasswordNotFoundException(),
    );
  });

  test('Generate Token ', async () => {
    await expect(userService.generateToken(tokenPayload)).resolves.toEqual(tokenResult);
  });

  test('Authenticate user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userDetails);
    bcryptCompare.mockReturnValue(true);
    await expect(userService.authenticate(authenticateUserDto)).resolves.toMatchObject(
      expect.objectContaining(userDetails),
    );
  });

  test('Authenticate user', async () => {
    bcryptCompare.mockReturnValue(true);
    await expect(await userService.authenticate(authenticateUserDto)).toBeFalsy();
  });

  test('Authenticate user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userDetails);
    bcryptCompare.mockReturnValue(false);
    await expect(await userService.authenticate(authenticateUserDto)).toBeFalsy();
  });

  test('Validate Token', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userDetails);
    bcryptCompare.mockReturnValue(true);
    await expect(userService.validateToken(tokenResult.token)).resolves.toBeTruthy();
  });
});
