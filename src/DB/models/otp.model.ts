import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.model';

export enum OTPTypeEnum {
  Verify_Email = 'verifyEmail',
  Reset_Password = 'RESET PASSWORD',
}
@Schema({
  timestamps: true,
})
export class OTP {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: User.name,
  })
  userId: Types.ObjectId;
  @Prop({
    type: String,
    required: true,
  })
  otp: string;
  @Prop({
    type: String,
    required: true,
    enum: Object.values(OTPTypeEnum),
  })
  type: OTPTypeEnum;
  @Prop({
    type: Date,
    required: true,
  })
  expiresIn: Date;
}
export type OTPDocument = HydratedDocument<OTP>;
export const OTPSchema = SchemaFactory.createForClass(OTP);
OTPSchema.index(
  {
    userId: 1,
    type: 1,
  },
  {
    unique: true,
    expireAfterSeconds: 0,
    expires: 1000 * 5 * 60,
  },
);
export const OTPModel = MongooseModule.forFeature([
  {
    name: OTP.name,
    schema: OTPSchema,
  },
]);
