import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Users, UsersDocument } from '../users/users.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...details } = createUserDto;
    const exists = await this.usersModel.findOne({ email: details.email });
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

    return user;
  }
  async signIn(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid details');
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid details');
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }

  async getUser(id: string) {
    return await this.findOne(id);
  }

  findByEmail(email: string) {
    return this.usersModel.findOne({ email });
  }

  async findOne(id: string) {
    const user = await this.usersModel.findById(id);
    if (!user) throw new NotFoundException();
    const obj = this.removeSensitiveField(user);

    return obj;
  }

  removeSensitiveField(user: UsersDocument) {
    if (!user) throw new NotFoundException();
    const obj = user.toObject() as Partial<typeof user>;
    delete obj.password;
    delete obj.sessions;

    return obj;
  }
}
