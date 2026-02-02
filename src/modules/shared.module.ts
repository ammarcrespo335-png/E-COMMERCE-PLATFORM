import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { jwtService } from '../common/utils/Security/token';
import { UserRepo } from '../DB/repository/User.repository';
import { User, userSchema } from '../DB/models/user.model';
import { Payment, paymentSchema } from '../DB/models/payment.model';
import { Product, productSchema } from '../DB/models/product.model';
import { Order, OrderSchema } from '../DB/models/order.model';
import { Cart, CartSchema } from '../DB/models/cart.model';
import { ProductRepo } from '../DB/repository/Products.repository';
import { Category, CategorySchema } from '../DB/models/category.model';
import { CategoryRepo } from '../DB/repository/Category.repository';
import { CartRepo } from '../DB/repository/Cart.repository';
import { Coupon, couponSchema } from '../DB/models/coupon.model';
import { CouponRepo } from '../DB/repository/Coupon.repository';
import { OrderRepo } from '../DB/repository/Order.repository';
import { StripeService } from '../common/utils/Stripe/stripe.service';
import { OTPRepo } from '../DB/repository/Otp.repository';
import { OTP, OTPSchema } from '../DB/models/otp.model';
import { Shop, ShopSchema } from '../DB/models/shop.model';
import { ShopService } from './shop/shop.service';
import { ShopRepo } from '../DB/repository/Shop.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: userSchema },
      { name: Payment.name, schema: paymentSchema },
      { name: Product.name, schema: productSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Coupon.name, schema: couponSchema },
      { name: OTP.name, schema: OTPSchema },
      { name: Shop.name, schema: ShopSchema },
    ]),
  ],
  providers: [
    JwtService,
    jwtService,
    UserRepo,
    ProductRepo,
    CategoryRepo,
    CartRepo,
    CouponRepo,
    OrderRepo,
    StripeService,
    OTPRepo,
    ShopRepo,
    ShopService,
  ],
  exports: [
    JwtService,
    jwtService,
    ProductRepo,
    UserRepo,
    MongooseModule,
    CategoryRepo,
    CartRepo,
    CouponRepo,
    OrderRepo,
    StripeService,
    OTPRepo,
    ShopService,
    ShopRepo,
  ],
})
export class SharedModule {}
