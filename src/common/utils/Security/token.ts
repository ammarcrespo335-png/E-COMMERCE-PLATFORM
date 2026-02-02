import { Injectable } from '@nestjs/common';
import {
  JwtService as JWT,
  JwtSignOptions,
  JwtVerifyOptions,
} from '@nestjs/jwt';

@Injectable()
export class jwtService {
  constructor(private readonly jwtService: JWT) {}
  sign({
    payload,
    options,
  
  }: {
    payload: any;
    options?: JwtSignOptions;
 
  }) {
    const token = this.jwtService.sign(payload, {
      secret: process.env.LOGIN_SECRET,
      expiresIn: '1d',
      ...options,
    });
    return token;
  }
  Verify({
    token,
    options,
    secret,
  }: {
    token: string;
    options: JwtVerifyOptions;
    secret?: string;
  }) {
    const result = this.jwtService.verify(token, {
      secret: process.env.LOGIN_SECRET,
      ...options,
    });
    return result;
  }
}
