import { Payment } from './../models/payment.model';
import { Injectable } from '@nestjs/common';
import { DBRepo } from './DB.repository';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PaymentRepo extends DBRepo<Payment> {
  constructor(
    @InjectModel(Payment.name) private readonly PaymentModel: Model<Payment>,
  ) {
    super(PaymentModel);
  }
}
