import { Model, Document, UpdateQuery } from "mongoose";

// FilterQuery was removed in mongoose 9.x, use this type instead
type FilterQuery<T> = Record<string, any> | Partial<T>;

export class BaseService<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return document.save();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id);
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter);
  }

  async findMany(
    filter: FilterQuery<T> = {},
    options: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
      populate?: string | string[];
    } = {}
  ): Promise<T[]> {
    let query = this.model.find(filter);

    if (options.skip) {
      query = query.skip(options.skip);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.sort) {
      query = query.sort(options.sort);
    }
    if (options.populate) {
      query = query.populate(options.populate);
    }

    return query.exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async updateOne(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, data, { new: true });
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }

  async softDelete(id: string): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }
}
