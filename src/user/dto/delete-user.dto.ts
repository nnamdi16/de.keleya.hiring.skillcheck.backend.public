import { PickType } from '@nestjs/swagger';
import { UpdateUserDto } from './update-user.dto';
export class DeleteUserDto extends PickType(UpdateUserDto, ['id'] as const) {}
