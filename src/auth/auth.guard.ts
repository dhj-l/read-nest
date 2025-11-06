import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { jwtConstants } from 'src/user/constants';
import { UserStatus } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.getToken(request);
    if (!token) {
      throw new UnauthorizedException('请先登录');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      const user = await this.userService.findOne(payload.sub);
      if (user.status === UserStatus.DISABLED) {
        throw new UnauthorizedException('用户已被禁用');
      }
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException('token 无效');
    }
    return true;
  }

  getToken(request: Request) {
    const [type, token] = request.headers['authorization']?.split(' ') || [];
    return type === 'Bearer' ? token : null;
  }
}
