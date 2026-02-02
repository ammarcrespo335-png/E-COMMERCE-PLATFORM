import {
  BadRequestException,
  UnauthorizedException,
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { jwtService } from '../utils/Security/token';
import { HydratedDocument, Types } from 'mongoose';
import { UserRepo } from '../../DB/repository/User.repository';
import { User } from '../../DB/models/user.model';
export interface AuthReq extends Request {
  user: HydratedDocument<User>;
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly JwtService: jwtService,
    private readonly userRepo: UserRepo,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req: AuthReq = context.switchToHttp().getRequest();
      const auth = req.headers.authorization;
      if (!auth || !auth?.startsWith(process.env.BEARER as string)) {
        throw new UnauthorizedException('in-valid token ');
      }
      const token = auth.split(' ')[1];
      const payload: { _id: Types.ObjectId; email: string } =
        await this.JwtService.Verify({
          token,
          options: { secret: process.env.LOGIN_SECRET },
        });
      
      const user = await this.userRepo.findById({
        id: payload._id.toString(),
      });
      if (!user) {
        throw new BadRequestException('user`s deleted ');
      }
      if (!user.isEmailVerified) {
        throw new ForbiddenException('email not confirmed');
      }
      req.user = user;
      return true;
    } catch (err) {
       console.log('GUARD ERROR ===>', err); // السطر ده هيقولنا العطل فين بالظبط
       throw new UnauthorizedException(
          'Invalid or expired token',
       );
    }
  }

  async canRefresh(context: ExecutionContext): Promise<boolean> {
    try {
      const req: AuthReq = context.switchToHttp().getRequest();
      const auth = req.headers.authorization;
      if (!auth || !auth?.startsWith(process.env.BEARER as string)) {
        throw new UnauthorizedException('in-valid token ');
      }
      const token = auth.split(' ')[1];
      const payload: { _id: Types.ObjectId; email: string } =
        await this.JwtService.Verify({
          token,
          options: { secret: process.env.REFRESH_SECRET },
        });
      const user = await this.userRepo.findById({
        id: payload._id.toString(),
      });
      if (!user) {
        throw new BadRequestException('user`s deleted ');
      }
      if (!user.isEmailVerified) {
        throw new ForbiddenException('email not confirmed');
      }
      req.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
