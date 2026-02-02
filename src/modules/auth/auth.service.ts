import fs from 'fs/promises';
import { RoleEnum } from './../../DB/models/user.model';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { User } from '../../DB/models/user.model';

import { UserRepo } from '../../DB/repository/User.repository';
import { OTPService } from '../../common/utils/Email/create.otp';
import { OTPTypeEnum } from '../../DB/models/otp.model';
import {
  Email_Events_Enum,
  emailEmitter,
} from '../../common/utils/Email/email.events';
import { authTemplate } from '../../common/utils/Email/generate.html';
import { compareHash, createHash } from '../../common/utils/Security/hash';

import { jwtService } from '../../common/utils/Security/token';
import { Types } from 'mongoose';
import { ProductRepo } from '../../DB/repository/Products.repository';
import { CartRepo } from '../../DB/repository/Cart.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly UserRepo: UserRepo,
    private readonly otpService: OTPService,
    private readonly jwtService: jwtService,
    private readonly productRepo: ProductRepo,
    private readonly cartRepo: CartRepo,
  ) {}
  private async registerUser(data: User, Role: RoleEnum) {
    const { Name, email, password } = data;
    const isEmailExist = await this.UserRepo.findByEmail(email);
    if (isEmailExist) {
      throw new BadRequestException('email already exists');
    }
    const user = await this.UserRepo.create({
      data: {
        Name,
        email,
        password: await createHash(password),

        role: Role,
      },
    });
    const otp = await this.otpService.CreateOtp({
      userId: user._id,
      type: OTPTypeEnum.Verify_Email,
    });
    const html = authTemplate({
      code: otp,
      name: `${Name}`,
      subject: 'verify your email',
      appName: 'E_COMMERCE-PLATFORM',
      type: 'verify',
    });
    emailEmitter.publish(Email_Events_Enum.Verify_Email, {
      to: email,
      subject: 'verify your email ',
      html,
    });
    return user;
  }
  async signup(data: User) {
    const User = await this.registerUser(data, RoleEnum.User);
    return {
      data: {
        id: User._id,
        name: User.Name,
        email: User.email,

        isEmailVerified: User.isEmailVerified || false,
        role: User.role,
      },
    };
  }
  async createAdmin(data: User) {
    const User = await this.registerUser(
      data,
      RoleEnum.Admin ,
    );
    return {
      data: {
        id: User._id,
        name: User.Name,
        email: User.email,

        isEmailVerified: User.isEmailVerified || false,
        role: User.role,
      },
    };
  }
  async shopOwner(data: User) {
    const User = await this.registerUser(
      data,
       RoleEnum.ShopOwner,
    );
    return {
      data: {
        id: User._id,
        name: User.Name,
        email: User.email,

        isEmailVerified: User.isEmailVerified || false,
        role: User.role,
      },
    };
  }

  async confirmEmail(data: { otp: string; email: string }) {
    const isEmailExist = await this.UserRepo.findByEmail(data.email);
    if (!isEmailExist) {
      throw new NotFoundException('email not found');
    }
    await this.otpService.ValidateOtp({
      otp: data.otp,
      userId: isEmailExist._id,
      type: OTPTypeEnum.Verify_Email,
    });
    await this.UserRepo.updateOne({
      filter: { _id: isEmailExist._id },
      update: { $set: { isEmailVerified: true } },
    });
    return { msg: 'email verified successfully' };
  }
  async resendOtp(data: { email: string }) {
    const isEmailExist = await this.UserRepo.findByEmail(data.email);
    if (!isEmailExist) {
      throw new NotFoundException('email not found');
    }
    if (isEmailExist.isEmailVerified) {
      throw new BadRequestException('email already Verified ');
    }
    const otp = await this.otpService.CreateOtp({
      type: OTPTypeEnum.Verify_Email,
      userId: isEmailExist._id,
    });
    const html = authTemplate({
      code: otp,
      name: isEmailExist.Name,
      subject: 'Resend Email Otp , Verify Your Email',
      appName: 'E_COMMERCE-PLATFORM',
      type: 'verify',
    });
    emailEmitter.publish(Email_Events_Enum.Verify_Email, {
      to: isEmailExist.email,
      Subject: 'resend email Otp , please verify your email  ',
      html,
    });
    return {
      message: 'Otp is Resending Successfully ',
    };
  }
  async Login(data: { email: string; password: string }) {
    const user = await this.UserRepo.findByEmail(data.email);
    if (!user) {
      throw new BadRequestException(
        'in-valid credentials , user not confirmed',
      );
    }
    if (!user.password) {
      throw new BadRequestException(
        'User password not set. Please reset your password.',
      );
    }
    if (!user.isEmailVerified) {
      throw new BadRequestException(
        'Email is not verified. Please verify your email first.',
      );
    }

    if (!(await compareHash(data.password, user.password))) {
      throw new BadRequestException('in-valid password');
    }
    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign({
      payload,
      options: {
        expiresIn: '1day',
        secret: process.env.LOGIN_SECRET,
      },
    });
    if (!process.env.LOGIN_SECRET) {
      throw new Error('LOGIN_SECRET is not defined');
    }
    const refreshToken = this.jwtService.sign({
      payload,
      options: {
        expiresIn: '7d',
        secret: process.env.REFRESH_SECRET,
      },
    });
    return {
      msg: 'you`re logged in',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }
  async ForgotPassword(data: { email: string }) {
    const isEmailExist = await this.UserRepo.findByEmail(data.email);
    if (!isEmailExist) {
      throw new BadRequestException('email not found');
    }
    if (!isEmailExist.isEmailVerified) {
      throw new BadRequestException(' email not verified');
    }
    const otp = await this.otpService.CreateOtp({
      type: OTPTypeEnum.Reset_Password,
      userId: isEmailExist._id,
    });
    const html = authTemplate({
      code: otp,
      name: isEmailExist.Name,
      subject: 'Reset your password OTP',
      appName: 'E_COMMERCE-PLATFORM',
      type: 'reset',
    });
    emailEmitter.publish(Email_Events_Enum.Reset_Password, {
      to: isEmailExist.email,
      Subject: 'Reset your password OTP  ',
      html,
    });
    await this.UserRepo.updateOne({
      filter: { _id: isEmailExist._id },
      update: {
        $set: {
          passwordOtp: {
            otp: await createHash(otp),
            expiredAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        },
      },
    });

    return { msg: 'OTP sent successfully', data: { isEmailExist: data.email } };
  }
  async ResetPassword(data: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    const isEmailExist = await this.UserRepo.findByEmail(data.email);

    if (!isEmailExist) {
      throw new BadRequestException('email not found');
    }
    if (!isEmailExist.isEmailVerified) {
      throw new BadRequestException(' email not verified');
    }
    if (
      isEmailExist.passwordOtp?.expiredAt &&
      isEmailExist.passwordOtp.expiredAt < new Date(Date.now())
    ) {
      throw new BadRequestException('OTP expired. Please request a new one.');
    }

    if (!isEmailExist.passwordOtp?.otp) {
      throw new BadRequestException('use forget password first');
    }
    if (!(await compareHash(data.otp, isEmailExist.passwordOtp.otp))) {
      throw new BadRequestException('otp not correct');
    }
    await this.otpService.ValidateOtp({
      otp: data.otp,
      userId: isEmailExist._id,
      type: OTPTypeEnum.Reset_Password,
    });

    await this.UserRepo.updateOne({
      filter: { _id: isEmailExist._id },
      update: {
        $set: {
          password: await createHash(data.newPassword),
        },
        $unset: { passwordOtp: '' },
      },
    });

    return {
      msg: 'Password reset successfully',
    };
  }
  async addShippingAddress(
    userId: Types.ObjectId,
    locationInfo: {
      email: string;
      phone: string;
      googleMapUrl: string;
      addressDetails?: string;
    },
  ) {
    const user = await this.UserRepo.findOneAndUpdate({
      filter: { _id: userId },

      update: { $push: { shippingAddress: locationInfo } },
      options: { new: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user.shippingAddress;
  }
  async deleteUser(userId: Types.ObjectId) {
    try {
      const userProducts = await this.productRepo.find({
        filter: { createdBy: userId },
      });
      if (userProducts && userProducts.length > 0) {
        //استخدمت flatMap  لانها بتعمل وظيفه حاجتين الmap , flatten  يعني
        // لو كنت استخدم الmap  بس هيضرب مني الunlink  و عندي برضو اليوزر عاوز امسحله كل الصور بتاعت البرودكت
        //  Map: بتدخل جوه كل منتج وتجيب مصفوفة الصور بتاعته//
        // Flatten:بتفك المصفوفات دي وتطلع اللي جواهم وترصهم كلهم في مصفوفة واحدة
        //بتعمل فك للمصفوفه و بعدينspread ...
        const allImages = userProducts.flatMap((p) => p.image || []);
        await Promise.all(
          allImages.map((img) =>
            fs.unlink(img).catch((error: string) => error),
          ),
        );
      }
      await this.productRepo.deleteMany({ filter: { createdBy: userId } });
      await this.cartRepo.deleteOne({ filter: { userId: userId } });
      const deletedUser = await this.UserRepo.deleteOne({
        filter: { _id: userId },
      });
      if (!deletedUser.deletedCount) {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      console.log(error);
    }
    return { msg: 'User and all related data deleted' };
  }
}
