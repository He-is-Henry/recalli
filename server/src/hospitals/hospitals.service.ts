import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Hospital } from './hospitals.schema';
import { RegisterHospitalDto } from './dto/register-hospital.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CounterService } from '../counter/counter.service';
import { Users } from '../users/users.schema';

@Injectable()
export class HospitalsService {
  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<Hospital>,
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private counterService: CounterService,
  ) {}

  async registerHospital(dto: RegisterHospitalDto) {
    const existingUser = await this.usersModel.findOne({
      email: dto.adminEmail,
    });
    if (existingUser) {
      throw new ConflictException('Admin email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);
    const hospitalId = new Types.ObjectId();

    // 1. Create the hospital_admin user WITH hospitalId
    const adminUser = await this.usersModel.create({
      email: dto.adminEmail,
      password: hashedPassword,
      role: 'hospital_admin',
      hospitalId,
    });

    // 2. Generate sequential Public ID (e.g. HOSP-1000)
    const seq = await this.counterService.getNextSequence('hospital_public_id');
    const publicId = `HOSP-${seq}`;

    // 3. Create the Hospital document using pre-generated _id
    const hospital = await this.hospitalModel.create({
      _id: hospitalId,
      email: dto.email,
      name: dto.name,
      address: dto.address,
      publicId,
      adminUser: adminUser._id,
    });

    return {
      message: 'Hospital and Admin account registered successfully',
      hospital: {
        id: hospital._id,
        name: hospital.name,
        publicId: hospital.publicId,
      },
      admin: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        hospitalId: adminUser.hospitalId,
      },
    };
  }

  // Create Staff account under this Hospital
  async createStaff(hospitalId: string, dto: CreateStaffDto) {
    const existingUser = await this.usersModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const staffUser = await this.usersModel.create({
      email: dto.email,
      password: hashedPassword,
      role: 'hospital_staff',
      hospitalId: new Types.ObjectId(hospitalId),
    });

    return {
      _id: staffUser._id,
      email: staffUser.email,
      role: staffUser.role,
      createdAt: staffUser.createdAt,
    };
  }

  // Fetch all Staff belonging to this Hospital
  async getStaff(hospitalId: string) {
    return this.usersModel
      .find({
        hospitalId: new Types.ObjectId(hospitalId),
        role: 'hospital_staff',
      })
      .select('email role createdAt')
      .sort({ createdAt: -1 });
  }

  async search(query: string) {
    if (!query) return [];
    return this.hospitalModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { publicId: { $regex: query, $options: 'i' } },
        ],
      })
      .select('name publicId address')
      .limit(10);
  }

  async findByAdminUser(adminUserId: string) {
    return this.hospitalModel.findOne({ adminUser: adminUserId });
  }

  async findOne(id: string) {
    return this.hospitalModel.findById(id);
  }
}
