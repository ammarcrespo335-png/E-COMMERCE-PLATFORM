import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderRepo } from '../../../DB/repository/Order.repository';
import { Types } from 'mongoose';
import { PaymentEnum } from '../../../DB/models/payment.model';
import { CartRepo } from '../../../DB/repository/Cart.repository';
import { CouponService } from '../../coupon/coupon.service';
import { Product } from '../../../DB/models/product.model';
import { UserRepo } from '../../../DB/repository/User.repository';
import { OrderStatusEnum } from '../../../DB/models/order.model';
import { StripeService } from '../../../common/utils/Stripe/stripe.service';

@Injectable()
export class UserOrderService {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly cartRepo: CartRepo,
    private readonly couponService: CouponService,
    private readonly userRepo: UserRepo,
    private readonly stripeService: StripeService,
  ) {}
  async createOrder(
    userId: Types.ObjectId,
    data: {
      paymentMethod: PaymentEnum;
      shippingAddress: Types.ObjectId;
      couponCode: string;
    },
  ) {
    const cart = await this.cartRepo.findOne({
      filter: {
        userId: userId,
      },
      options: {
        populate: [
          {
            path: 'items.productId',
          },
        ],
      },
    });
    if (!cart || cart.items.length == 0) {
      throw new BadRequestException('cart is empty');
    }

    const existingOrder = await this.orderRepo.findOne({
      filter: {
        userId,
        status: OrderStatusEnum.PendingPayment,
      },
    });

    if (existingOrder) {
      throw new BadRequestException(
        'You already have a pending order, please complete payment first',
      );
    }
    for (const item of cart.items) {
      const product = item.productId as unknown as Product;
      if (!product) {
        throw new BadRequestException('product not found');
      }
      if (product.stock == 0) {
        throw new BadRequestException('product out of stock');
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product "${product.name}" Available: ${product.stock}, requested: ${item.quantity}`,
        );
      }
    }
    const subTotal = cart.items.reduce((totalPrice, item) => {
      const product = item.productId as unknown as Product;
      return totalPrice + product.salePrice * item.quantity;
    }, 0);

    const orderProducts = cart.items.map((CartItem) => {
      const product = CartItem.productId as unknown as Product;
      if (!product)
        throw new BadRequestException(
          `Product ${CartItem.productId as unknown as string} not found`,
        );
      return {
        productId: CartItem.productId._id,
        quantity: CartItem.quantity,
        priceAtPurchase: product.salePrice,
      };
    });
    const user = await this.userRepo.findOne({
      filter: {
        _id: userId,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const Address = user.shippingAddress.find(
      (addr) => addr._id.toString() == data.shippingAddress.toString(),
    );
    if (!Address) {
      throw new BadRequestException(
        'Shipping address not found in your profile',
      );
    }
    let discountAmount = 0;
    let finalPrice = subTotal;
    let couponApplied = false;

    if (data.couponCode) {
      const coupon = await this.couponService.applyCoupon(
        {
          code: data.couponCode,
          totalPrice: subTotal,
        },
        true,
      );
      discountAmount = coupon.discountAmount;
      finalPrice = coupon.finalPrice;
      couponApplied = true;
    }
    const order = await this.orderRepo.create({
      data: {
        userId,
        products: orderProducts,
        shippingAddress: [
          {
            email: Address.email,
            googleMapUrl: Address.googleMapUrl,
            phone: Address.phone,
            addressDetails: Address.addressDetails,
          },
        ],
        subTotal,
        discount: discountAmount,
        total: finalPrice,
        paymentMethod: data.paymentMethod,
        couponCode: data.couponCode,
        couponApplied,
      },
    });
    await this.cartRepo.updateOne({
      filter: { userId },
      update: { isLocked: true },
    });

    if (data.paymentMethod == PaymentEnum.CreditCard) {
      const line_items = [
        {
          price_data: {
            currency: 'egp',
            product_data: {
              name: `Order #${order._id.toString()}`,
              description: `Payment for ${orderProducts.length} items`,
            },
            unit_amount: Math.round(finalPrice * 100),
          },
          quantity: 1,
        },
      ];
      const session = await this.stripeService.createCheckOutSession({
        customer_email: user.email,
        metadata: { orderId: order._id.toString() },
        line_items: line_items,
      });
      return {
        message: 'checkout is Done ',
        orderId: order._id,
        Url: session.url,
      };
    }
    return {
      message: 'Order placed successfully',
      orderId: order._id,
      finalPrice,
    };
  }
}
