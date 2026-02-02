import {
  Controller,
  NotFoundException,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard, type AuthReq } from '../../common/guards/auth.guard';
import {  Types } from 'mongoose';
import { UserRepo } from '../../DB/repository/User.repository';


@Controller('favorites')
export class FavoritesController {
  constructor(
    private readonly FavoritesService: FavoritesService,
    private readonly userRepo: UserRepo,
  ) {}
  @Patch('FAV_TOGGLE/:id')
  @UseGuards(AuthGuard)
  async FavToggle(@Req() req: AuthReq) {
    const userDocument = await this.userRepo.findById({
      id: req.user._id,
    });
    if (!userDocument) {
      throw new NotFoundException('User not found');
    }
    const productId = req.params.id as unknown as Types.ObjectId;
    const { msg } = await this.FavoritesService.FavToggle(
      productId,
      userDocument as any,
    );
    return {
      msg,
    };
  }
}
