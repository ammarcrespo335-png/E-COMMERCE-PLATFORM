import { Injectable } from '@nestjs/common';
import {
  Model,
  ProjectionType,
  QueryOptions,
  QueryFilter,
  Types,
  UpdateQuery,
  HydratedDocument,
  UpdateWithAggregationPipeline,
  MongooseUpdateQueryOptions,
} from 'mongoose';

@Injectable()
export abstract class DBRepo<T> {
  constructor(protected readonly model: Model<T>) {}
  async find({
    filter = {},
    Projection = {},
    options = {},
  }: {
    filter?: QueryFilter<T>;
    Projection?: ProjectionType<T>;
    options?: QueryOptions;
  }) {
    const docs = await this.model.find(filter, Projection, options).lean();
    return docs;
  }
  async findOne({
    filter = {},
    Projection = {},
    options = {},
  }: {
    filter?: QueryFilter<T>;
    Projection?: ProjectionType<T>;
    options?: QueryOptions;
  }) {
    const doc = await this.model.findOne(filter, Projection, options);
    return doc;
  }
  async findById({
    id,
    Projection = {},
    options = {},
  }: {
    id?: Types.ObjectId | string;
    Projection?: ProjectionType<T>;
    options?: QueryOptions;
  }) {
    const doc = await this.model.findById(id, Projection, options);
    return doc;
  }
  async create({ data }: { data: Partial<T> }): Promise<HydratedDocument<T>> {
    const doc = await this.model.create(data as any);
    return doc as HydratedDocument<T>;
  }

  async insertMany({ docs }: { docs: Array<Partial<T>> }) {
    const CreatedDocs = await this.model.insertMany(docs);
    return CreatedDocs;
  }
  async findOneAndDelete({
    filter,
    options = {},
  }: {
    filter?: QueryFilter<T>;
    options?: QueryOptions;
  }) {
    const doc = await this.model.findOneAndDelete(filter, options).lean();
    return doc;
  }
  async findOneAndUpdate({
    filter = {},
    update = {},
    options = {},
  }: {
    filter?: QueryFilter<T>;
    update?: UpdateQuery<T>;
    options?: QueryOptions;
  }) {
    const doc = await this.model
      .findOneAndUpdate(filter, update, options)
      .lean();
    return doc;
  }
  async findByIdAndDelete({
    id,
    options = {},
  }: {
    id: Types.ObjectId | string;
    options?: QueryOptions;
  }) {
    const doc = await this.model.findByIdAndDelete(id, options);
    return doc;
  }
  async findByIdAndUpdate({
    id,
    update,
    options = {},
  }: {
    id: Types.ObjectId | string;
    update?: UpdateQuery<T>;
    options?: QueryOptions;
  }) {
    const doc = await this.model.findByIdAndUpdate(id, update, options);
    return doc;
  }

  async deleteMany(filter: QueryFilter<T>) {
    return this.model.deleteMany(filter);
  }
  async deleteOne({ filter }: { filter?: QueryFilter<T> }) {
    return this.model.deleteOne(filter);
  }
  async updateOne({
    filter = {},
    update = {},
    options = {},
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T> | UpdateWithAggregationPipeline;
    options?: MongooseUpdateQueryOptions;
  }) {
    return this.model.updateOne(filter, update, options);
  }
  async updateMany({
    filter,
    update,
    options
  }: {
      filter: QueryFilter<T>,
      update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: (MongooseUpdateQueryOptions<T>)
    }) {
     return this.model.updateMany(filter, update, options);
  }
  async Paginate({
    filter,
    page,
    limit,
    projection,
    options = {},
  }: {
    filter: QueryFilter<T>;
    page: number;
    limit: number;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }) {
    const skip = (page - 1) * limit;
    return this.model
      .find(filter, projection, { ...options, skip, limit })
      .lean();
  }
  async FindActiveCartByUser({ userId }: { userId: Types.ObjectId | string }) {
    return this.model.find({ userId }).lean();
  }
  async FindOrdersByUser({ userId }: { userId: Types.ObjectId | string }) {
    return this.model.find({ userId }).lean();
  }
  async FindOrdersByAdmin({ adminId }: { adminId: Types.ObjectId | string }) {
    return this.model.find({ adminId }).lean();
  }
  async FindValidOtp({
    type,
    userId,
    code,
  }: {
    type: string;
    userId: Types.ObjectId | string;
    code: string;
  }) {
    return this.model.findOne({
      userId,
      type,
      code,
    });
  }
  async invalidOtp({
    type,
    userId,
  }: {
    type: string;
    userId: Types.ObjectId | string;
  }) {
    return this.model.updateMany({ userId, type }, { expiresAt: new Date() });
  }
}
