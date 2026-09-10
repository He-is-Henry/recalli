import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PatientHospitalLink,
  LinkStatus,
  LinkCreatedBy,
} from './patient-hospital-link.schema';
import { Users } from '../users/users.schema';

@Injectable()
export class PatientHospitalLinksService {
  constructor(
    @InjectModel(PatientHospitalLink.name)
    private linkModel: Model<PatientHospitalLink>,
    @InjectModel(Users.name)
    private userModel: Model<Users>,
  ) {}

  async createLink(
    patientId: string,
    hospitalId: string,
    createdBy: LinkCreatedBy,
  ) {
    const existing = await this.linkModel.findOne({ patientId, hospitalId });
    if (existing) {
      if (existing.status === LinkStatus.REVOKED) {
        existing.status = LinkStatus.PENDING;
        existing.createdBy = createdBy;
        return existing.save();
      }
      return existing;
    }

    return this.linkModel.create({
      patientId: new Types.ObjectId(patientId),
      hospitalId: new Types.ObjectId(hospitalId),
      status:
        createdBy === LinkCreatedBy.HOSPITAL_ADMIN
          ? LinkStatus.ACTIVE
          : LinkStatus.PENDING,
      createdBy,
    });
  }

  async getMyHospitals(patientId: string) {
    return this.linkModel
      .find({ patientId })
      .populate('hospitalId', 'name publicId address');
  }

  // Dashboard Overview KPIs
  async getDashboardStats(hospitalId: string, staffId?: string) {
    const filter: Record<string, any> = {
      hospitalId: new Types.ObjectId(hospitalId),
    };
    if (staffId) {
      filter.staffId = new Types.ObjectId(staffId);
    }

    const [totalPatients, pendingRequests, activePatients] = await Promise.all([
      this.linkModel.countDocuments(filter),
      this.linkModel.countDocuments({ ...filter, status: LinkStatus.PENDING }),
      this.linkModel.countDocuments({ ...filter, status: LinkStatus.ACTIVE }),
    ]);

    return { totalPatients, pendingRequests, activePatients };
  }

  // Patient Roster (Admins see all; Staff see only assigned patients)
  async getHospitalPatients(
    hospitalId: string,
    status?: LinkStatus,
    search?: string,
    staffId?: string,
  ) {
    const query: Record<string, any> = {
      hospitalId: new Types.ObjectId(hospitalId),
    };
    if (status) query.status = status;
    if (staffId) query.staffId = new Types.ObjectId(staffId);

    const links = await this.linkModel
      .find(query)
      .populate({
        path: 'patientId',
        select: 'email publicId createdAt',
        match: search
          ? {
              $or: [
                { email: { $regex: search, $options: 'i' } },
                { publicId: { $regex: search, $options: 'i' } },
              ],
            }
          : undefined,
      })
      .populate('staffId', 'email publicId')
      .sort({ createdAt: -1 });

    return links.filter((link) => link.patientId !== null);
  }

  // Hospital Admin: Assign staff member to patient
  async assignStaff(linkId: string, staffId: string, hospitalId: string) {
    const link = await this.linkModel.findById(linkId);
    if (!link) throw new NotFoundException('Link record not found');
    if (link.hospitalId.toString() !== hospitalId) {
      throw new UnauthorizedException('Access denied');
    }

    // Verify assigned user is staff or admin in the same hospital
    const staffUser = await this.userModel.findOne({
      _id: staffId,
      hospitalId: new Types.ObjectId(hospitalId),
    });
    if (!staffUser) {
      throw new NotFoundException('Staff member not found in this hospital');
    }

    link.staffId = new Types.ObjectId(staffId);
    return link.save();
  }

  async verifyLink(linkId: string, adminUserId: string, hospitalId: string) {
    const link = await this.linkModel.findById(linkId);
    if (!link) throw new NotFoundException('Link record not found');
    if (link.hospitalId.toString() !== hospitalId) {
      throw new UnauthorizedException('Access denied');
    }

    link.status = LinkStatus.ACTIVE;
    link.verifiedBy = new Types.ObjectId(adminUserId);
    link.verifiedAt = new Date();
    return link.save();
  }

  async revokeLink(linkId: string, hospitalId: string) {
    const link = await this.linkModel.findById(linkId);
    if (!link) throw new NotFoundException('Link record not found');
    if (link.hospitalId.toString() !== hospitalId) {
      throw new UnauthorizedException('Access denied');
    }

    link.status = LinkStatus.REVOKED;
    return link.save();
  }

  async verifyActiveRelationship(
    hospitalId: string,
    patientId: string,
  ): Promise<boolean> {
    const link = await this.linkModel.findOne({
      hospitalId: new Types.ObjectId(hospitalId),
      patientId: new Types.ObjectId(patientId),
      status: LinkStatus.ACTIVE,
    });
    return !!link;
  }
}
