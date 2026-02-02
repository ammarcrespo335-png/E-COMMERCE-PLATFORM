import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { OrderRepo } from '../../DB/repository/Order.repository';
import { StripeService } from '../../common/utils/Stripe/stripe.service';
import { OrderStatusEnum } from '../../DB/models/order.model';
import { AdminService } from '../orders/admin/admin.service';

import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly stripeService: StripeService,
    private readonly orderService: AdminService,
    private readonly couponService: CouponService,
  ) {}
  async paymentWithStripe(
    id: Types.ObjectId,
    user: { _id: Types.ObjectId; email: string },
  ) {
    const order = await this.orderRepo.findOne({
      filter: {
        _id: id,
        userId: user._id,
        status: OrderStatusEnum.PendingPayment,
      },
      options: {
        populate: [
          {
            path: 'products.productId',
            model: 'Product',
          },
        ],
      },
    });
    if (!order) {
      throw new BadRequestException(' order not found');
    }
    const session = await this.stripeService.createCheckOutSession({
      customer_email: user.email,
      metadata: {
        orderId: order._id.toString(),
      },
      line_items: order.products.map((item: any) => {
        return {
          price_data: {
            currency: 'egp',
            product_data: {
              name: item.productId.name,
              description: item.productId.description,
            },
            unit_amount: item.priceAtPurchase * 100,
          },
          quantity: item.quantity,
        };
      }),
    });
    return { url: session.url };
  }
  async paymentWebHook(payload: Buffer, signature: string) {
    try {
      const event = await this.stripeService.constructEvent({
        payload,
        signature,
      });
      if (event.type == 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata?.orderId as string;
        if (!orderId) {
          throw new BadRequestException('orderId not found');
        }
        const order = await this.orderRepo.findOne({
          filter: { _id: orderId },
        });
        if (!order) {
          throw new BadRequestException('order not found');
        }
        if (order?.couponCode) {
          await this.couponService.applyCoupon({
            code: order.couponCode,
            totalPrice: order.subTotal,
          });
        }
        const userEmail = session.customer_email?.trim().toLocaleLowerCase();
        if (!userEmail) {
          throw new BadRequestException('userEmail not found');
        }
        await this.orderService.markAsPaid(new Types.ObjectId(orderId));
        return {
          msg: 'payment is completed ',
          orderId: `${orderId}`,
          userEmail: `${userEmail}`,
        };
      }
      return { received: true, type: event.type };
    } catch (error) {
      throw new BadRequestException(`Webhook Error `, error as string);
    }
  }
}
