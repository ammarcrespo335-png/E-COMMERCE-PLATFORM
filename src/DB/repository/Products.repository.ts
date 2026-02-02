import { Product } from './../models/product.model';

import { Model } from 'mongoose';
import { DBRepo } from './DB.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProductRepo extends DBRepo<Product> {
  constructor(
    @InjectModel(Product.name) private readonly ProductModel: Model<Product>,
  ) {
    super(ProductModel);
  }
}