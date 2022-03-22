import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs/internal/Observable';
import { IS_PUBLIC_ENDPOINT_KEY } from '../decorators/publicEndpoint.decorator';
import { JwtTokenUser } from '../types/jwtTokenUser';

@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt']) implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector, private readonly jwtService: JwtService) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    if (!req?.headers?.authorization) {
      throw new ForbiddenException('Unauthenticated user');
    }
    const token = req?.headers?.authorization.split(' ')[1];

    const details: JwtTokenUser | string = this.jwtService.decode(token) ?? '';
    req['user'] = details;
    const getMeta = (key: string) => this.reflector.get(key, context.getHandler());
    const isPublicEndpoint = getMeta(IS_PUBLIC_ENDPOINT_KEY);
    if (isPublicEndpoint) {
      return true;
    }

    return super.canActivate(context);
  }
}
