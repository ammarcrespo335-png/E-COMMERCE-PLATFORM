import { Controller, Patch, Post, Req, UseGuards, Get } from '@nestjs/common';
import { AuthGuard, type AuthReq } from '../../common/guards/auth.guard';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Post('addToCart')
  async addToCart(@Req() req: AuthReq) {
    const user = req.user;
    const productData = req.body;
    const { data } = await this.cartService.addToCart(user._id, productData);
    return {
      data,
      msg: 'item added',
    };
  }
  @Patch('removeToCart')
  async removeToCart(@Req() req: AuthReq) {
    const user = req.user;
    const productData = req.body;
    const { data } = await this.cartService.removeToCart(user._id, productData);
    return {
      data,
      msg: 'item removed',
    };
  }
  @Patch('updateQuantity')
  async updateQuantity(@Req() req: AuthReq) {
    const user = req.user;
    const productData = req.body;
    const { data } = await this.cartService.updatedQuantity(
      user._id,
      productData,
    );
    return {
      data,
      msg: 'item updated',
    };
  }
  @Get('get_Cart')
  async get_cart(@Req() req: AuthReq) {
    const user = req.user;
    const data = await this.cartService.getCart(user._id);
    return {
      ...data,
      msg: 'the cart is retrieved ',
    };
  }
}
