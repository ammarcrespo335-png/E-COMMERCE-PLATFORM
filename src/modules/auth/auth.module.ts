import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepo } from '../../DB/repository/User.repository';
import { OTPRepo } from '../../DB/repository/Otp.repository';

import { User, userSchema } from '../../DB/models/user.model';
import { Cart, CartSchema } from '../../DB/models/cart.model';
import { Payment, paymentSchema } from '../../DB/models/payment.model';
import { Product, productSchema } from '../../DB/models/product.model';
import { Order, OrderSchema } from '../../DB/models/order.model';
import { OTP, OTPSchema } from '../../DB/models/otp.model';
import { OTPService } from '../../common/utils/Email/create.otp';
import { jwtService } from '../../common/utils/Security/token';
import { JwtService } from '@nestjs/jwt';
import { ProductRepo } from '../../DB/repository/Products.repository';
import { CartRepo } from '../../DB/repository/Cart.repository';
import { SharedModule } from '../shared.module';

@Module({
  imports: [
SharedModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepo,
    OTPRepo,
    OTPService,
    jwtService,
    JwtService,
    ProductRepo,
    CartRepo,
  ],
  exports: [ProductRepo, CartRepo],
})
export class AuthModule {}
