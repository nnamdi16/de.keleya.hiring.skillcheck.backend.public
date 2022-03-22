import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsArray, IsDate, IsIn, IsNumber, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class FindUserDto extends PartialType(PickType(CreateUserDto, ['name', 'email'] as const)) {
  @ApiProperty({
    description: 'Date of update',
    example: '2019-09-26T07:58:30.996+0200',
    required: false,
    title: 'updateSince',
  })
  @IsDate()
  updatedSince?: Date;

  @IsNumber({}, { each: true })
  @ApiProperty({
    description: 'User Ids',
    example: [2, 3],
    required: false,
    title: 'id',
    type: [Number],
  })
  id?: number[];

  @IsNumber()
  @ApiProperty({
    description: 'Data limit',
    example: 10,
    required: false,
    title: 'limit',
  })
  limit?: number;

  @IsNumber()
  @ApiProperty({
    description: 'Offset value',
    example: 0,
    required: false,
    title: 'offset',
  })
  offset?: number;

  @IsString()
  @IsIn(['asc', 'desc'])
  @ApiProperty({
    description: 'Order Data',
    example: 'asc',
    required: false,
    title: 'orderBy',
  })
  orderBy?: 'asc' | 'desc';
}
