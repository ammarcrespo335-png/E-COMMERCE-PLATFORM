import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { SharedModule } from '../shared.module';
import { CartController } from './cart.controller';
@Module({
  imports: [SharedModule],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
