import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderRepo } from '../../../DB/repository/Order.repository';
import { Order, OrderStatusEnum } from '../../../DB/models/order.model';
import { Types } from 'mongoose';
import { ProductRepo } from '../../../DB/repository/Products.repository';
import { CartRepo } from '../../../DB/repository/Cart.repository';

@Injectable()
export class AdminService {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly productRepo: ProductRepo,
    private readonly cartRepo: CartRepo,
  ) { }
  async findAllOrders(data: { status?: OrderStatusEnum }) {
    const orderStatus: Partial<Order> = {};
    if (data.status) orderStatus.status = data.status;
    const orders = await this.orderRepo.find({
      filter: orderStatus,
      options: { sort: { createdAt: -1 } },
    });
    return { data: orders, msg: 'success', status: 200 };
  }
  async updateOrderStatus(orderId: Types.ObjectId, status: OrderStatusEnum) {
    const order = (await this.orderRepo.findOne({
      filter: {
        _id: orderId,
      },
    })) as Order;
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (
      status == OrderStatusEnum.Canceled &&
      order.status !== OrderStatusEnum.Canceled
    ) {
      await Promise.all(
        order.products.map(
          (product: { productId: Types.ObjectId; quantity: number }) =>
            this.productRepo.updateOne({
              filter: { _id: product.productId },
              update: { $inc: { stock: product.quantity } },
            }),
        ),
      );
    }
    if (status == OrderStatusEnum.Confirmed) {
      await this.cartRepo.updateOne({
        filter: { userId: order.userId },
        update: { items: [], isLocked: false },
      });
    }
    if (status == OrderStatusEnum.Canceled) {
      await this.cartRepo.updateOne({
        filter: { userId: order.userId },
        update: { isLocked: false },
      });
    }

    const updateOrder = await this.orderRepo.updateOne({
      filter: { _id: orderId },
      update: { status: status, new: true },
    });
    return {
      msg: 'Order status updated successfully',
      data: updateOrder,
      status: 200,
    };
  }
  async markAsPaid(orderId: Types.ObjectId) {
    const updatedStatusOrder = await this.orderRepo.findById({ id: orderId })

   
    if (!updatedStatusOrder) {
      throw new BadRequestException('order not found')
    }
    if (updatedStatusOrder.isPaid) {
      throw new BadRequestException("order already paid")
    }
    const updatedOrder = await this.orderRepo.findByIdAndUpdate({
      id: orderId,
      update: {
        status: OrderStatusEnum.Confirmed,
        isPaid: true,
        paidAt: new Date()
      }
        
    }   )
  return {
    orderId,
    msg: "Order updated to paid successfully"
  };
  }
}
  

