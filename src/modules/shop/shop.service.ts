import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShopRepo } from '../../DB/repository/Shop.repository';
import { RoleEnum, User } from '../../DB/models/user.model';
import { Types } from 'mongoose';

@Injectable()
export class ShopService {
  constructor(private readonly shopRepo: ShopRepo) {}
  async createShop(user: User, data: { name: string; image: string }) {
    const shopIsExist = await this.shopRepo.findOne({
      filter: { name: data.name, createdBy: user._id },
    });
    if (shopIsExist) {
      throw new BadRequestException('Shop with this name already exists');
    }
    const shop = await this.shopRepo.create({
      data: {
        name: data.name,
        image: data.image,
        createdBy: user._id,
        shopActivationStatus: 'Pending',
        isActive: true,
      },
    });
    return {
      msg: 'Shop created successfully',
      data: shop,
    };
  }
  async changeShopStatus(
    shopId: Types.ObjectId,
    shopStatus: 'Accepted' | 'Refused',
  ) {
    const shop = await this.shopRepo.findOne({ filter: { _id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');
    if (!shop.isActive) {
      throw new BadRequestException('shop is`t Active');
      }
      if (shop.shopActivationStatus == shopStatus) {
        throw new BadRequestException(`Shop is already ${shopStatus}`);
      }
    shop.shopActivationStatus = shopStatus;
      await shop.save();
        return {
          msg: `Shop status changed to ${shopStatus}`,
          data: shop,
        };
  }
}
