import { Injectable } from '@nestjs/common';
import { DBRepo } from './DB.repository';
import { User } from '../models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserRepo extends DBRepo<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel);
  }
  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).select('+password');
  }
}
