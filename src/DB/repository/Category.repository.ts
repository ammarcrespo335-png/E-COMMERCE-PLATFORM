import { Category } from '../models/category.model';


import { Model } from 'mongoose';
import { DBRepo } from './DB.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class CategoryRepo extends DBRepo<Category> {
  constructor(
    @InjectModel(Category.name) private readonly CategoryModel: Model<Category>,
  ) {
    super(CategoryModel);
  }
}