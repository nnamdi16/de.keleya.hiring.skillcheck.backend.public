import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtTokenUser } from '../../src/common/types/jwtTokenUser';
import { EndpointIsPublic } from '../../src/common/decorators/publicEndpoint.decorator';
import { JwtAuthGuard } from '../../src/common/guards/jwt-auth.guard';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async find(@Query() findUserDto: FindUserDto, @Req() req: Request) {
    return this.usersService.find(req.user as JwtTokenUser, findUserDto);
  }

  @Get('/:id')
  @ApiBearerAuth()
  @EndpointIsPublic()
  @UseGuards(JwtAuthGuard)
  async findUnique(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.usersService.findUnique({ id }, true, req.user);
  }

  @Post('/')
  @ApiResponse({
    status: 200,
    description: 'Subrequest created successfully',
  })
  @ApiBody({ type: CreateUserDto, description: 'Create a new user with credentials' })
  async create(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.usersService.create(createUserDto);
  }

  @Patch()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    return this.usersService.update(req.user as JwtTokenUser, updateUserDto);
  }

  @Delete()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async delete(@Body() deleteUserDto: DeleteUserDto, @Req() req: Request) {
    return this.usersService.delete(req.user as JwtTokenUser, deleteUserDto);
  }

  @Post('validate')
  @EndpointIsPublic()
  @ApiHeader({
    name: 'token',
    description: 'Custom header',
  })
  async userValidateToken(@Req() req: Request) {
    const { headers } = req;
    return this.usersService.validateToken(headers.authorization as string);
  }

  @Post('authenticate')
  @EndpointIsPublic()
  async userAuthenticate(@Body() authenticateUserDto: AuthenticateUserDto) {
    return this.usersService.authenticate(authenticateUserDto);
  }

  @Post('token')
  @EndpointIsPublic()
  async userGetToken(@Body() authenticateUserDto: AuthenticateUserDto) {
    return this.usersService.authenticateAndGetJwtToken(authenticateUserDto);
  }
}
