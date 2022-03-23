import { CreateUserDto } from './create-user.dto';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['name', 'email', 'email_confirmed', 'password'] as const),
) {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @ApiProperty({
    description: 'User id',
    example: 2,
    nullable: false,
    required: true,
    title: 'id',
  })
  id: number;
}
