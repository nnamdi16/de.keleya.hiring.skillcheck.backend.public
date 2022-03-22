import { CreateUserDto } from './dto/create-user.dto';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { UserService } from '../user/user.service';
import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class UserHealthIndicator extends HealthIndicator {
  constructor(private readonly userService: UserService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const userDetails: CreateUserDto = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password12345',
    };
    const user = await this.userService.create(userDetails);
    const isHealthy = this.getStatus('create-endpoint', true, user);
    if (user.status === HttpStatus.CREATED) {
      return isHealthy;
    }

    throw new HealthCheckError('User Service failed', user);
  }
}
