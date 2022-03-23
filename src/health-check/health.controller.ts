import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { UserHealthIndicator } from '../user/user.health';

@Controller('health')
@ApiTags('health')
class HealthController {
  constructor(private health: HealthCheckService, private userHealthIndicator: UserHealthIndicator) {}

  @Get()
  @HealthCheck()
  check() {
    // return this.health.check([]);
    return this.health.check([async () => this.userHealthIndicator.isHealthy()]);
  }
}

export default HealthController;
