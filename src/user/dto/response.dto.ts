import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export interface GenericMatch {
  [key: string]: string | number | Date | any;
}
export class Response implements Readonly<Response> {
  @ApiProperty({
    description: 'Response Status',
    example: HttpStatus.OK,
    nullable: false,
    required: true,
    title: 'status',
    type: HttpStatus,
  })
  @IsNotEmpty()
  @IsString()
  status: HttpStatus;

  @ApiProperty({
    description: 'data',
    example: 'data',
    nullable: false,
    required: true,
    title: 'data',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  data: GenericMatch;
}
