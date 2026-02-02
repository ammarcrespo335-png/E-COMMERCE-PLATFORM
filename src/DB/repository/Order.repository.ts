import { Model } from "mongoose";
import { Order } from "../models/order.model";
import { DBRepo } from "./DB.repository";
import { InjectModel } from "@nestjs/mongoose";

export class OrderRepo extends DBRepo<Order> {
  constructor(
    @InjectModel(Order.name) private readonly OrderModel: Model<Order>,
  ) {
    super(OrderModel);
  }
}
