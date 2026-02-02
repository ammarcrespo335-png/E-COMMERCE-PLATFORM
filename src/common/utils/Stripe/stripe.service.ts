import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  constructor() {}
  createCheckOutSession = async ({
    customer_email,
    metadata,
    line_items,
    discounts,
  }: {
    discounts?: Stripe.Checkout.SessionCreateParams.Discount[];
    line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
    customer_email: string;
    metadata: Record<string, string>;
  }) => {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email,
      metadata,
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      line_items,
      discounts,
    });
    return session;
  };
  constructEvent = async({payload , signature}:{payload:Buffer , signature:string})=>{
    
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
if (!webhookSecret) {
  throw new BadRequestException("webHook is missing")
}
return this.stripe.webhooks.constructEvent(payload,signature,webhookSecret)
  }
}
