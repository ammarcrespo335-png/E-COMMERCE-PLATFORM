import { BadGatewayException, BadRequestException, Body, Controller, Get, Headers, Param, Post, Query, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthReq } from '../../common/guards/auth.guard';
import { PaymentService } from './payment.service';
import { Types } from 'mongoose';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('checkout/:orderId')
  @UseGuards(AuthGuard)
  async createCheckout(
    @Param('orderId') orderId: Types.ObjectId,
    @Body('user') user: { _id: string; email: string },
  ) {
    return this.paymentService.paymentWithStripe(orderId, {
      _id: new Types.ObjectId(user._id),
      email: user.email,
    });
  }
  @Post('webhook')
  async webHook(
    @Req() req: RawBodyRequest<AuthReq>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException(' signature not found');
    }
    if (!req.rawBody) {
      throw new BadRequestException('Raw body not found ');
    }
    return this.paymentService.paymentWebHook(req.rawBody, signature);
  }
  @Get('/success')
  async handleSuccess(@Query('session_id') sessionId: string) {
    return {
      message: 'mission Done ',
      sessionId: sessionId,
    };
  }
  @Get('/cancel')
  async handleCancel(@Query('session_id') sessionId: string) {
    return {
      message: 'mission canceled ',
      sessionId: sessionId,
    };
  }
}
