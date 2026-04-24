import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Session, Users, UsersDocument } from '../users/users.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MetadataDto } from './metadata.dto';

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

    const user = await this.usersModel.create({ password: hashed, ...details });
    return this.removeSensitiveField(user);
  }

  async signIn(email: string, password: string, metadata: MetadataDto) {
    const user = await this.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid details');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid details');

    const payload = { sub: user._id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      }),
    ]);

    const session: Session = {
      refreshToken,
      createdAt: new Date(),
      ...metadata,
    };

    await this.usersModel.findByIdAndUpdate(user._id, {
      $push: {
        sessions: {
          $each: [session],
          $slice: -5,
        },
      },
    });

    return { accessToken, refreshToken };
  }

  async refresh(token: string) {
    const payload = await this.jwtService
      .verifyAsync<{ sub: string; email: string; role: string }>(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      })
      .catch(() => {
        throw new UnauthorizedException('Invalid refresh token');
      });

    // Check token exists in user's sessions
    const user = await this.usersModel.findOne({
      _id: payload.sub,
      'sessions.refreshToken': token,
    });
    if (!user) throw new UnauthorizedException('Session expired or invalid');

    const newPayload = { sub: user._id, email: user.email, role: user.role };

    const [accessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(newPayload),
      this.jwtService.signAsync(newPayload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      }),
    ]);

    // Rotate refresh token — replace old with new in the session
    await this.usersModel.findOneAndUpdate(
      { _id: user._id, 'sessions.refreshToken': token },
      { $set: { 'sessions.$.refreshToken': newRefreshToken } },
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async signOut(userId: string, refreshToken: string) {
    await this.usersModel.findByIdAndUpdate(userId, {
      $pull: { sessions: { refreshToken } },
    });
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
    return this.removeSensitiveField(user);
  }

  removeSensitiveField(user: UsersDocument) {
    const obj = user.toObject() as Partial<typeof user>;
    delete obj.password;
    delete obj.sessions;
    return obj;
  }
}
