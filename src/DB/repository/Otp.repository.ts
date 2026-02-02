import { Injectable } from '@nestjs/common';
import { DBRepo } from './DB.repository';
import { User } from '../models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OTP } from '../models/otp.model';

@Injectable()
export class OTPRepo extends DBRepo<OTP> {
  constructor(@InjectModel(OTP.name) private readonly OTPModel: Model<OTP>) {
    super(OTPModel);
  }

}
