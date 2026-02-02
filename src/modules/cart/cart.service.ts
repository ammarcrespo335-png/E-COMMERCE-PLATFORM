import { BadRequestException, Injectable } from '@nestjs/common';
import { CartRepo } from '../../DB/repository/Cart.repository';
import { Types } from 'mongoose';
import { ProductRepo } from '../../DB/repository/Products.repository';
import { Cart, CartItem } from '../../DB/models/cart.model';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepo,
    private readonly productRepo: ProductRepo,
  ) {}
  private calculateCartTotal(
    cart: Cart,
    products: {
      _id: Types.ObjectId;
      originalPrice: number;
      salePrice?: number;
    }[],
  ) {
    return cart.items.reduce<number>((total, item) => {
      // تحولها ل قيمه واحده reduce هي بتاخد ارااي كامله و بتحولها ل
      const product = products.find(
        (p) => p._id.toString() === item.productId.toString(),
      );
      if (!product) return total;

      const price = product.salePrice ?? product.originalPrice ?? 0;
      return total + Number(item.quantity) * price;
    }, 0);
  }

  async addToCart(
    userId: Types.ObjectId,
    productData: {
      productId: Types.ObjectId;
      quantity: number;
    },
  ) {
    if (!productData?.productId) {
      throw new BadRequestException('productId is required');
    }
    const product = await this.productRepo.findOne({
      filter: {
        _id: productData.productId.toString(),
        stock: {
          $gte: productData.quantity,
        },
      },
    });
    if (!product) {
      throw new BadRequestException('product not found  or stock not enough');
    }
    let userCart = await this.cartRepo.findOne({
      filter: {
        userId: userId,
      },
    });
    if (!userCart) {
      userCart = await this.cartRepo.create({
        data: {
          userId,
          items: [
            {
              productId: product._id,
              quantity: productData.quantity,
            },
          ],
        },
      });
    } else {
      const productIndex = userCart.items.findIndex((item) => {
        return item.productId.toString() == productData.productId.toString();
      });
      if (productIndex == -1) {
        userCart.items.push({
          productId: product._id,
          quantity: productData.quantity,
        });
      } else {
        const foundItem = userCart.items[productIndex];
        const totalQuantity =
          Number(foundItem.quantity) + Number(productData.quantity);
        if (totalQuantity > product.stock) {
          throw new BadRequestException(
            `only ${product.stock} items available`,
          );
        } else {
          userCart.items[productIndex].quantity = totalQuantity;
        }
      }
    }
    const productIds = userCart.items.map((i) => i.productId);
    const products = await this.productRepo.find({
      filter: { _id: { $in: productIds } },
    });
    await userCart.populate('items.productId');
    userCart.totalPrice = this.calculateCartTotal(userCart, products);
    await userCart.save();

    return { data: userCart, msg: 'added to cart successfully' };
  }
  async removeToCart(
    userId: Types.ObjectId,
    productData: {
      productId: Types.ObjectId;
      quantity: number;
    },
  ) {
    if (!productData.productId) {
      throw new BadRequestException('productId is required');
    }
    const product = await this.productRepo.findOne({
      filter: { _id: productData.productId.toString() },
    });
    if (!product) {
      throw new BadRequestException('product not found');
    }
    const userCart = await this.cartRepo.findOne({
      filter: {
        userId: userId,
      },
    });
    if (!userCart) {
      throw new BadRequestException('cart not found ');
    }
    userCart.items = userCart.items.filter((item) => {
      return item.productId.toString() !== productData.productId.toString();
    });
    const productIds = userCart.items.map((i) => i.productId);
    const products = await this.productRepo.find({
      filter: { _id: { $in: productIds } },
    });
    await userCart.populate('items.productId');
    userCart.totalPrice = this.calculateCartTotal(userCart, products);
    await userCart.save();
    return { message: 'Item removed from cart successfully', data: userCart };
  }
  async updatedQuantity(
    userId: Types.ObjectId,
    productData: {
      productId: Types.ObjectId;
      quantity: number;
    },
  ) {
    if (!productData?.productId) {
      throw new BadRequestException('productId is required');
    }
    const product = await this.productRepo.findOne({
      filter: {
        _id: productData.productId.toString(),
      },
    });
    if (!product) {
      throw new BadRequestException('product not found');
    }
    const userCart = await this.cartRepo.findOne({
      filter: {
        userId: userId,
      },
    });
    if (!userCart) {
      throw new BadRequestException('Cart not found');
    } else {
      const productIndex = userCart.items.findIndex((item) => {
        const idInCart = item.productId['_id']
          ? item.productId['_id'].toString()
          : item.productId.toString();
        return idInCart === productData.productId.toString();
      });

      if (productIndex == -1) {
        throw new BadRequestException('Product not in cart');
      } else {
        const foundItem = userCart.items[productIndex];
        const totalQuantity =
          Number(foundItem.quantity) + Number(productData.quantity);
        if (totalQuantity > product.stock) {
          throw new BadRequestException(
            `only ${product.stock} items available`,
          );
        } else {
          userCart.items[productIndex].quantity = totalQuantity;
        }
      }
    }

    const productIds = userCart.items.map((i) => i.productId);
    const products = await this.productRepo.find({
      filter: { _id: { $in: productIds } },
    });

    userCart.totalPrice = this.calculateCartTotal(userCart, products);
    await userCart.save();
    await userCart.populate('items.productId');
    return { data: userCart, msg: 'Quantity updated successfully' };
  }
  async getCart(userId: Types.ObjectId) {
    const userCart = await this.cartRepo.findOne({
      filter: {
        userId: userId,
      },
    });
    if (!userCart) {
      return {
        msg: 'cart is empty',
        data: {
          item: [],
          totalPrice: 0,
        },
      };
    }
    return {
      msg: 'Cart retrieved successfully',
      data: userCart,
    };
  }
}
