import { customAlphabet } from 'nanoid';
import { OTPTypeEnum } from '../../../DB/models/otp.model';
import { Types } from 'mongoose';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OTPRepo } from '../../../DB/repository/Otp.repository';

import { compareHash, createHash } from '../Security/hash';

@Injectable()
export class OTPService {
  constructor(private readonly otpRepo: OTPRepo) {}
  async CreateOtp({
    type = OTPTypeEnum.Verify_Email,
    userId,
  }: {
    type?: OTPTypeEnum;
    userId: Types.ObjectId;
  }) {
    const otp = customAlphabet('0123456789')(7);
    const IsOtpExist = await this.otpRepo.findOne({ filter: { userId, type } });
    if (IsOtpExist && IsOtpExist.expiresIn > new Date(Date.now())) {
      throw new BadRequestException(
        'otp already sent please try after some time',
      );
    }
    const hashedOtp = await createHash(otp);
    if (!IsOtpExist) {
      await this.otpRepo.create({
        data: {
          userId,
          type,
          otp: hashedOtp,
          expiresIn: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
      return otp;
    } else {
      IsOtpExist.otp = await createHash(otp);
      IsOtpExist.expiresIn = new Date(Date.now() + 5 * 60 * 1000);
      await IsOtpExist.save();
      return otp;
    }
  }

  async ValidateOtp({
    otp,
    userId,
    type,
  }: {
    otp: string;
    userId: Types.ObjectId;
    type: OTPTypeEnum;
  }) {
    const userOtp = await this.otpRepo.findOne({
      filter: {
        userId,
        type,
      },
    });
    if (!userOtp) {
      throw new NotFoundException('otp not found');
    }
    if (userOtp.expiresIn < new Date(Date.now())) {
      throw new BadRequestException('otp is expired');
    }
    if (!(await compareHash(otp, userOtp.otp))) {
      throw new BadRequestException('otp not correct');
    }
    await this.otpRepo.deleteOne({});
  }
}
