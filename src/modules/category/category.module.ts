import { Module } from '@nestjs/common';
import { SharedModule } from '../shared.module';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  imports: [SharedModule],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
