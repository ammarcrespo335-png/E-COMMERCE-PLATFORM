import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { ZodPipe } from '../../common/pipes/zod.pipes';
import { SignUpSchema } from './authValidation/SignUp.Schema';

import { RoleEnum, User } from '../../DB/models/user.model';
import { ConfirmEmailSchema } from './authValidation/ConfirmEmail.Schema';
import { LoginSchema } from './authValidation/Login.Schema';
import { AuthGuard, AuthReq } from '../../common/guards/auth.guard';
import { ForgotPasswordSchema } from './authValidation/ForgotPassword.Schema';
import { ResetPasswordSchema } from './authValidation/ResetPassword.Schema';
import { CreateAdminSchema } from './authValidation/CreateAdmin.Schema';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { Types } from 'mongoose';
import { CreateShopAdminSchema } from './authValidation/ShopAdmin.Schema';

// -------------------------------------------------------------------------------//

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  @UsePipes(new ZodPipe(SignUpSchema))
  async signup(@Body() data: User) {
    return this.authService.signup(data);
  }
  @Post('createAdmin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @UsePipes(new ZodPipe(CreateAdminSchema))
  async createAdmin(@Body() data: User) {
    return this.authService.createAdmin(data);
  }
  @Post('shopAdmin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @UsePipes(new ZodPipe(CreateShopAdminSchema))
  async createShopAdmin(@Body() data: User) {
    return this.authService.shopOwner(data);
  }
  @Patch('confirmEmail')
  @UsePipes(new ZodPipe(ConfirmEmailSchema))
  async confirmEmail(@Body() { otp, email }: { otp: string; email: string }) {
    return this.authService.confirmEmail({ email, otp });
  }
  @Patch('ResendOtp')
  async ResendOtp(@Body() { email }: { email: string }) {
    return this.authService.resendOtp({ email });
  }
  @Post('login')
  @UsePipes(new ZodPipe(LoginSchema))
  async Login(
    @Body() { email, password }: { email: string; password: string },
  ) {
    return this.authService.Login({ email, password });
  }
  @Get('GetUserProfile')
  @UseGuards(AuthGuard)
  async GetProfile(@Req() { user }: { user: string }) {
    return { data: user };
  }
  @Post('forgotPassword')
  @UsePipes(new ZodPipe(ForgotPasswordSchema))
  async ForgotPassword(@Body() { email }: { email: string }) {
    return this.authService.ForgotPassword({ email });
  }
  @Post('resetPassword')
  @UsePipes(new ZodPipe(ResetPasswordSchema))
  async resetPassword(
    @Body()
    {
      email,
      otp,
      newPassword,
    }: {
      email: string;
      otp: string;
      newPassword: string;
    },
  ) {
    return this.authService.ResetPassword({ email, otp, newPassword });
  }
  @Post('add-Shipping-Address')
  @UseGuards(AuthGuard)
  async addShippingAddress(
    @Req() req: AuthReq,
    @Body()
    locationInfo: {
      email: string;
      phone: string;
      googleMapUrl: string;
      addressDetails?: string;
    },
  ) {
    const userId = req.user._id;
    return await this.authService.addShippingAddress(userId, locationInfo);
  }
  @Delete('delete-account')
  @UseGuards(AuthGuard)
  async delete_user(@Req() req: AuthReq) {
    const userId = req.user._id;
    return await this.authService.deleteUser(userId);
  }
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin)
  @Delete('delete-user/:userId')
  async deleteUserByAdmin(@Req() req: AuthReq) {
    const userId = new Types.ObjectId(req.params.userId);
    return await this.authService.deleteUser(userId);
  }
}
