import { InjectModel } from '@nestjs/mongoose';
import { Cart } from '../models/cart.model';
import { DBRepo } from './DB.repository';
import { Model } from 'mongoose';

export class CartRepo extends DBRepo<Cart> {
  constructor(@InjectModel(Cart.name) private readonly cartModel: Model<Cart>) {
    super(cartModel);
  }
}
