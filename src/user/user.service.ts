import { EmailOrPasswordNotFoundException } from './../common/exception-filters/EmailOrPasswordNotFound';
import { hashPassword, matchHashedPassword } from './../common/utils/password';
import { UserAlreadyExistsException } from './../common/exception-filters/UserAlreadyExistsException';
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma.services';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotFoundException } from '../common/exception-filters/UserNotFoundException';
import { ConfigService } from '@nestjs/config';
import { GenericMatch, Response } from './dto/response.dto';
import { JwtTokenUser } from '../../src/common/types/jwtTokenUser';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Finds users with matching fields
   *
   * @param findUserDto
   * @returns User[]
   */
  async find(user: JwtTokenUser, findUserDto: FindUserDto): Promise<User[]> {
    if (!user.is_admin) {
      const details = await this.prisma.user.findMany({
        where: {
          id: user.id,
        },
      });
      return details;
    }
    const { name = '', email = '', updatedSince, id = [], limit = 10, offset = 0, orderBy } = findUserDto;
    const ids = id.map((str) => Number(str));
    const idQuery = id.length ? { in: ids } : {};
    const dateQuery = updatedSince ? { lte: new Date(updatedSince) } : {};
    const emailQuery = !email ? { contains: email } : email;
    return this.prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: name,
            },
            email: emailQuery,
            updated_at: dateQuery,
            id: idQuery,
          },
        ],
      },
      orderBy: {
        updated_at: orderBy,
      },
      take: Number(limit),
      skip: Number(offset),
      include: {
        credentials: true,
      },
    });
  }

  /**
   * Finds single User by id, name or email
   *
   * @param whereUnique
   * @returns User
   */
  async findOne(whereUnique: Prisma.UserWhereUniqueInput, includeCredentials = false) {
    return this.prisma.user.findUnique({
      where: whereUnique,
      include: { credentials: includeCredentials },
      rejectOnNotFound: false,
    });
  }

  /**
   * Finds single User by id, name or email and userInfo
   *
   * @param whereUnique
   * @param includeCredentials
   * @param user
   *
   * @returns User
   */
  async findUnique(whereUnique: Prisma.UserWhereUniqueInput, includeCredentials = false, user?: JwtTokenUser) {
    if (user?.id !== whereUnique.id && !user?.is_admin) {
      throw new UnauthorizedException();
    }

    return await this.findOne(whereUnique, includeCredentials);
  }

  /**
   * Creates a new user with credentials
   *
   * @param createUserDto
   * @returns result of create
   */
  async create(createUserDto: CreateUserDto): Promise<Response> {
    try {
      const isExistingUser = await this.findOne({ email: createUserDto.email });
      if (isExistingUser) {
        throw new UserAlreadyExistsException();
      }
      const { password, ...userData } = createUserDto;
      const hashedPassword = hashPassword(password);
      await this.prisma.user.create({
        data: {
          ...userData,
          credentials: {
            create: { hash: hashedPassword },
          },
        },
      });
      return {
        status: HttpStatus.CREATED,
        data: { message: 'User successfully created' },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      } else {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * Updates a user unless it does not exist or has been marked as deleted before
   *
   * @param updateUserDto
   * @returns result of update
   */
  async update(user: JwtTokenUser, updateUserDto: UpdateUserDto) {
    try {
      if (!user.is_admin && user.id !== updateUserDto.id) {
        throw new UserNotFoundException();
      }
      const userDetails = await this.findOne({ id: updateUserDto.id });
      if (userDetails?.isDeleted) {
        throw new UserNotFoundException();
      }
      const { id, password, ...updates } = updateUserDto;

      if (!user.is_admin) {
        const credentials = password
          ? {
              update: { hash: hashPassword(password as string) },
            }
          : {};
        return await this.updateById(id, updates, credentials);
      }
      return await this.updateById(id, { ...updates });
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      } else {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * Updates a user by Id unless it does not exist or has been marked as deleted before
   *
   * @param updateUserDto
   * @param id
   * @returns result of update
   */
  async updateById(id: number, updateUserDto: Omit<UpdateUserDto, 'id'>, credentials?: GenericMatch) {
    const data = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        credentials,
      },
    });
    return data;
  }

  /**
   * Deletes a user
   * Function does not actually remove the user from database but instead marks them as deleted by:
   * - removing the corresponding `credentials` row from your db
   * - changing the name to DELETED_USER_NAME constant (default: `(deleted)`)
   * - setting email to NULL
   *
   * @param deleteUserDto
   * @returns results of users and credentials table modification
   */
  async delete(user: JwtTokenUser, deleteUserDto: DeleteUserDto) {
    if (!user.is_admin) {
      throw new UserNotFoundException();
    }
    const updateUser = await this.prisma.user.update({
      where: {
        id: deleteUserDto.id,
      },
      data: {
        isDeleted: true,
      },
    });
    const { credentials_id } = updateUser;
    this.prisma.credentials.delete({
      where: {
        id: credentials_id as number,
      },
    });
    return {
      users: {
        name: 'deleted',
      },
    };
  }

  /**
   * Authenticates a user and returns a JWT token
   *
   * @param authenticateUserDto email and password for authentication
   * @returns a JWT token
   */
  async authenticateAndGetJwtToken(authenticateUserDto: AuthenticateUserDto) {
    try {
      const { email, password } = authenticateUserDto;
      const userDetails = await this.findOne({ email }, true);
      if (!userDetails) {
        throw new UserNotFoundException();
      }
      const { credentials } = userDetails;

      const isValidPassword = await matchHashedPassword(password, credentials?.hash as string);
      if (!isValidPassword) {
        throw new EmailOrPasswordNotFoundException();
      }
      const payload: JwtTokenUser = {
        id: userDetails.id,
        username: email,
        is_admin: userDetails.is_admin as boolean,
        email_confirmed: userDetails.email_confirmed,
      };
      return this.generateToken(payload);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      } else {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  /**
   * Authenticates a user
   *
   * @param authenticateUserDto email and password for authentication
   * @returns true or false
   */
  async authenticate(authenticateUserDto: AuthenticateUserDto) {
    try {
      const { email, password } = authenticateUserDto;
      const userDetails = await this.findOne({ email }, true);
      if (!userDetails) {
        return false;
      }
      const { credentials } = userDetails;
      const isValidPassword = await matchHashedPassword(password, credentials?.hash as string);
      if (!isValidPassword) {
        return false;
      }
      return userDetails;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Validates a JWT token
   *
   * @param token a JWT token
   * @returns the decoded token if valid
   */
  async validateToken(token: string) {
    const decodedJwtAccessToken = await this.jwtService.decode(token.split(' ')[1]);
    if (!decodedJwtAccessToken) {
      throw new UserNotFoundException();
    }
    return true;
  }

  public async generateToken(payload: JwtTokenUser) {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: `${this.configService.get('JWT_EXPIRATION_TIME')}`,
    });
    return {
      token,
    };
  }
}
