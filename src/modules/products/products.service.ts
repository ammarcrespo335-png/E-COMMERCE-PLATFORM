import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '../../DB/models/product.model';
import { ProductRepo } from '../../DB/repository/Products.repository';
import { Types } from 'mongoose';
import fs from 'fs/promises';
import { CartRepo } from '../../DB/repository/Cart.repository';
import { ShopRepo } from '../../DB/repository/Shop.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepo: ProductRepo,
    private readonly cartRepo: CartRepo,
    private readonly shopRepo: ShopRepo,
  ) {}
  async CreateProduct(data: Partial<Product>): Promise<Product> {
    const shop = await this.shopRepo.findOne({
      filter: {
        _id: data.shopId,
      },
    });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    if (!shop || shop.shopActivationStatus !== 'Accepted') {
      throw new ForbiddenException(
        'can`t add products because shop not Verify By SUPER_ADMIN',
      );
    }
    const isProductExist = await this.productRepo.findOne({
      filter: {
        name: data.name,
        shopId: data.shopId,
        
      },
    });
    if (isProductExist) {
      throw new BadRequestException('product already exist');
    }
    const product = await this.productRepo.create({
      data,
    });

    return product.save();
  }
  async updateProduct(
    productId: Types.ObjectId,
    adminId: Types.ObjectId,
    data: Partial<Product>,
  ) {
    const product = await this.productRepo.findOne({
      filter: {
        _id: productId,
        createdBy: adminId,
      },
    });
    if (!product) {
      throw new NotFoundException('product not found');
    }

    if (data.name && data.name !== product.name) {
      const isNameExist = await this.productRepo.findOne({
        filter: {
          name: data.name,
          shopId: product.shopId,
          _id: { $ne: product._id }, ///يعني مينفعش يعدل منتج x ل منتج yلان y عندي اصلا
        },
      });
      if (isNameExist) {
        throw new BadRequestException('name already used');
      }
      product.name = data.name;
    }
    try {
      if (data.image && product.image) {
        await Promise.all(
          product.image.map((img) => fs.unlink(img).catch((err) => err)),
        );

        product.image = data.image;
      }
    } catch (err) {
      console.log('File delete failed:', err);
    }

    await product.save();
    return { msg: 'Product updated successfully', product };
  }
  async softDelete(productId: Types.ObjectId, adminId: Types.ObjectId) {
    const product = await this.productRepo.findOne({
      filter: { _id: productId, createdBy: adminId },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    if (!product.isActive) {
      throw new BadRequestException('Product is already frozen');
    }
    product.isActive = false;
    return product.save();
  }
  async hardDelete(productId: Types.ObjectId, adminId: Types.ObjectId) {
    try {
      const product = await this.productRepo.findOne({
        filter: { _id: productId, createdBy: adminId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      if (product.image?.length) {
        await Promise.all(
          product.image.map((img) => fs.unlink(img).catch((err) => err)),
        );
      }
      await this.cartRepo.updateMany({
        filter: { 'items.productId': productId },
        update: {
          $pull: { items: { productId: productId } },
          $set: { totalPrice: 0 },
        },
      });
      await this.cartRepo.deleteMany({
        items: { $size: 0 },
      });
      const isProductExist = await this.productRepo.deleteOne({
        filter: { _id: productId },
      });
      if (!isProductExist.deletedCount) {
        throw new NotFoundException(' no product  exist');
      }

      return { msg: 'Product is deleted' };
    } catch (error) {
      console.log(error);
    }
  }
  async searchForProducts(keyWord: string) {
    const regex = new RegExp(keyWord, 'i');
    const product = await this.productRepo.find({
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
    if (!product || product.length === 0) {
      throw new NotFoundException(
        'No products found for this keyword or this products are frozen',
      );
    }
    return { data: product, msg: 'success', status: 200 };
  }
  async findAllProducts() {
    const Products = await this.productRepo.find({
      filter: {},
      options: { sort: { name: 1 } },
    });
    return { data: Products, msg: 'success', status: 200 };
  }
}
