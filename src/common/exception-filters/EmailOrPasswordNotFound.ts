import { NotFoundException } from '@nestjs/common';

export class EmailOrPasswordNotFoundException extends NotFoundException {
  constructor() {
    super(`Email or Password does not exist`);
  }
}
