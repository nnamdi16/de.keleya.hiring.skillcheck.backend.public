import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto implements Readonly<CreateUserDto> {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    nullable: false,
    required: true,
    title: 'name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'johndoe@example.com',
    nullable: false,
    required: true,
    title: 'email',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password12345',
    nullable: false,
    required: true,
    title: 'password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiHideProperty()
  @IsBoolean()
  email_confirmed?: boolean;

  @ApiHideProperty()
  @IsBoolean()
  is_admin?: boolean;

  // @ApiHideProperty()
  // @IsDate()
  // created_at?: Date;

  // @ApiHideProperty()
  // @IsDate()
  // updated_at?: Date;
}
