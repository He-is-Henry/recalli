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
import { PatientHospitalLinksService } from '../patient-hospital-links/patient-hospital-links.service';
import { LinkCreatedBy } from '../patient-hospital-links/patient-hospital-link.schema';
import { CounterService } from '../counter/counter.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private jwtService: JwtService,
    private linksService: PatientHospitalLinksService,
    private counterService: CounterService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, hospitalId, ...details } = createUserDto;
    const exists = await this.usersModel.findOne({ email: details.email });
    if (exists) throw new ConflictException('Email already exist');
    const hashed = await bcrypt.hash(password, 10);

    // Generate sequential patient ID (e.g., PAT-1000)
    const seq = await this.counterService.getNextSequence('patient_public_id');
    const publicId = `PAT-${seq}`;

    const user = await this.usersModel.create({
      password: hashed,
      publicId,
      ...details,
    });

    if (hospitalId) {
      await this.linksService.createLink(
        user._id.toString(),
        hospitalId,
        LinkCreatedBy.PATIENT,
      );
    }

    return this.removeSensitiveField(user);
  }

  async signIn(email: string, password: string, metadata: MetadataDto) {
    const user = await this.findByEmail(email);
    if (!user) throw new UnauthorizedException('User does not exist');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid password');

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      ...(user.hospitalId && { hospitalId: user.hospitalId.toString() }),
    };

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
      .verifyAsync<{
        sub: string;
        email: string;
        role: string;
        hospitalId?: string;
      }>(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      })
      .catch(() => {
        throw new UnauthorizedException('Invalid refresh token');
      });

    const user = await this.usersModel.findOne({
      _id: payload.sub,
      'sessions.refreshToken': token,
    });
    if (!user) throw new UnauthorizedException('Session expired or invalid');

    const newPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      ...(user.hospitalId && { hospitalId: user.hospitalId.toString() }),
    };

    const [accessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(newPayload),
      this.jwtService.signAsync(newPayload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      }),
    ]);

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
