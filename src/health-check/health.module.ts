import { UserHealthIndicator } from './../user/user.health';
import { Module } from '@nestjs/common';
import HealthController from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma.services';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [UserHealthIndicator, UserService, PrismaService, JwtService, ConfigService],
})
export default class HealthModule {}
