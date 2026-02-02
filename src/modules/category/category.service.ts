import { Category } from './../../DB/models/category.model';
import fs from 'fs/promises';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CategoryRepo } from '../../DB/repository/Category.repository';
import { Types } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepo) {}
  async createCategory(data: Partial<Category>) {
    const isCategory = await this.categoryRepo.findOne({
      filter: { name: data.name },
    });
    if (isCategory) {
      throw new BadRequestException('Category already exist ');
    }
    const category = await this.categoryRepo.create({ data });
    return category;
  }
  async findAllCategories() {
    const categories = await this.categoryRepo.find({
      filter: {},
      options: { sort: { name: 1 } },
    });
    return { data: categories, msg: 'success', status: 200 };
  }
  async searchForCategories(keyWord: string) {
    const regex = new RegExp(keyWord, 'i');
    const category = await this.categoryRepo.find({
      filter: {
        $and: [
          { isActive: true },
          {
            $or: [{ name: regex }, { description: regex }],
          },
        ],
      },
      options: { limit: 20 },
    });
    if (!category || category.length === 0) {
      throw new NotFoundException(
        'No categories found for this keyword or this categories are frozen ',
      );
    }
    return { data: category, msg: 'success', status: 200 };
  }
  async updateCategory(
    categoryId: Types.ObjectId,
    adminId: Types.ObjectId,
    data: Partial<Category>,
  ) {
    const category = await this.categoryRepo.findOne({
      filter: {
        _id: categoryId,
        createdBy: adminId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (data.name && data.name !== category.name) {
      const isNameExist = await this.categoryRepo.findOne({
        filter: { name: data.name },
      });
      if (isNameExist) {
        throw new BadRequestException(
          'This name is already used by another category',
        );
      }
      category.name = data.name;
    }

    if (data.image) {
      try {
        if (category.image) {
          await fs.unlink(category.image);
        }
      } catch (err) {
        console.warn(
          'Old file delete failed, maybe it was already deleted:',
          err,
        );
      }
      category.image = data.image;
    }

    if (data.description) category.description = data.description;

    await category.save();
    return { msg: 'Category updated successfully', category };
  }
  async softDelete(categoryId: Types.ObjectId, adminId: Types.ObjectId) {
    const category = await this.categoryRepo.findOne({
      filter: {
        _id: categoryId,
        createdBy: adminId,
      },
    });
    if (!category) {
      throw new BadRequestException('category  not found');
    }
    if (!category.isActive) {
      throw new BadRequestException('category  is already frozen');
    }
    category.isActive = false;
    await category.save();
    return {
      success: true,
      message: 'Category frozen successfully',
      id: category._id,
    };
  }
  async hardDelete(categoryId: Types.ObjectId, adminId: Types.ObjectId) {
    const category = await this.categoryRepo.findOne({
      filter: {
        _id: categoryId,
        createdBy: adminId,
      },
    });
    if (!category) {
      throw new BadRequestException('category  not found');
    }
    try {
      if (category.image) {
        await fs.unlink(category.image);
      }
    } catch (error) {
      console.log(error);
    }
    const isCategoryExist = await this.categoryRepo.deleteOne({
      filter: {
        _id: categoryId,
      },
    });
    if (!isCategoryExist.deletedCount) {
      throw new NotFoundException(' no category  exist');
    }
    return { msg: 'category is deleted' };
  }
}
