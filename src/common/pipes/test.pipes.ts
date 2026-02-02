import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { SignUpDto } from '../../modules/auth/auth.dto/signup.dto';

@Injectable()
export class TestPipe implements PipeTransform {
  transform(value: SignUpDto, metadata: ArgumentMetadata) {
    console.log({
      value,
      metadata,
    });
    if (value.password && value.confirmPassword) {
      if (value.password !== value.confirmPassword) {
        throw new BadRequestException(
          'password must be equal to confirm password',
        );
      }
    }
    return value;
  }
}
