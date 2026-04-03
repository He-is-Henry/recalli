import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users, UsersDocument } from './users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private usersModel: Model<Users>) {}

  async findAll(role?: string) {
    console.log(role);
    if (!role) return this.usersModel.find();
    if (role !== 'admin' && role !== 'user') throw new BadRequestException();
    const users = await this.usersModel.find({ role });
    console.log(users);
    return users.map((u) => this.removeSensitiveField(u));
  }

  async findOne(id: string) {
    const user = await this.usersModel.findById(id);
    if (!user) throw new NotFoundException();
    const obj = this.removeSensitiveField(user);

    return obj;
  }

  findByEmail(email: string) {
    return this.usersModel.findOne({ email });
  }

  async promote(email: string) {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException();
    user.role = 'admin';
    await user.save();
    return this.removeSensitiveField(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersModel.findByIdAndUpdate(id, updateUserDto);
    if (!user) throw new NotFoundException();
    const obj = this.removeSensitiveField(user);
    return obj;
  }

  remove(id: string) {
    return this.usersModel.findByIdAndDelete(id);
  }

  removeSensitiveField(user: UsersDocument) {
    if (!user) throw new NotFoundException();
    const obj = user.toObject() as Partial<typeof user>;
    delete obj.password;
    delete obj.sessions;

    return obj;
  }
}
