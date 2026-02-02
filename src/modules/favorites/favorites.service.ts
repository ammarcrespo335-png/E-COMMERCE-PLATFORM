import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepo } from '../../DB/repository/User.repository';
import { ProductRepo } from '../../DB/repository/Products.repository';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../DB/models/user.model';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly productRepo: ProductRepo,
  ) {}
  async FavToggle(productId: Types.ObjectId, user: HydratedDocument<User>) {
    const product = await this.productRepo.findById({ id: productId });
    if (!product) {
      throw new NotFoundException('product not found');
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    const index = user.favorites.findIndex((prod) => {
      return prod.toString() === productId.toString();
    });

    if (index === -1) {
      user.favorites.push(productId);
      await user.save();
      return {
        msg: 'added to fav list',
      };
    } else {
      user.favorites.splice(index, 1);
      await user.save();
      return {
        msg: 'removed from fav list',
      };
    }
  }
}
