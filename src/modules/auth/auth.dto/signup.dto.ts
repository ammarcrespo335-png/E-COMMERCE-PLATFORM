
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsString,
  IsStrongPassword,
  Max,
  Min,
} from 'class-validator';
export const trimTransformer = ({ value }: { value: unknown }) => {
  // unknown  عشان مستخدمش as string  لان هي لو undefined او رقم ف كده هيسببلي مشكله ف الكود
  return typeof value === 'string' ? value.trim() : value;
};
export class SignUpDto {
  @IsEmail(
    {},
    {
      message: 'invalid email',
    },
  )
  @Transform(trimTransformer)
  email: string;
  @IsString({
    message: 'Name must be  a string',
  })
  @Transform(trimTransformer)
  Name: string;;
  @IsString()
  @IsStrongPassword({
    minLength: 9,
    minNumbers: 3,
    minUppercase: 3,
  })
  password: string;
  @IsString()
  @IsStrongPassword({
    minLength: 9,
    minNumbers: 3,
    minUppercase: 3,
  })
  confirmPassword: string;
}
