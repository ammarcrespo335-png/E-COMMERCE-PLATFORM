import { Injectable } from "@nestjs/common";
import { DBRepo } from "./DB.repository";
import { Shop } from "../models/shop.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ShopRepo extends DBRepo<Shop>{
    constructor(@InjectModel(Shop.name) private readonly ShopModel:Model<Shop>) {
        super(ShopModel);
    }
}