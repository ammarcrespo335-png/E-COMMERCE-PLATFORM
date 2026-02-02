import { Module } from '@nestjs/common';

import { SharedModule } from '../shared.module';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { ShopRepo } from '../../DB/repository/Shop.repository';

@Module({
  imports: [SharedModule],
  controllers: [ShopController],
  providers: [ShopService, ShopRepo],
  exports: [ShopRepo],
})
export class StoreModule {}
