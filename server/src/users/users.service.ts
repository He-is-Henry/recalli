import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users, UsersDocument } from './users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private usersModel: Model<Users>) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...details } = createUserDto;
    const exists = await this.usersModel.find({ email: details.email });
    if (exists) throw new ConflictException('Email already exist');
    const hashed = await bcrypt.hash(password, 10);

    const userObject = {
      password: hashed,
      ...details,
    };
    const user = await this.usersModel.create(userObject);
    const obj = user.toObject() as Partial<typeof user>;
    delete obj.password;
    delete obj.sessions;

    return;
  }

  findAll() {
    return this.usersModel.find();
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
