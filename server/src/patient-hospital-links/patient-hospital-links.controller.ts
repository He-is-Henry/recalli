import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { PatientHospitalLinksService } from './patient-hospital-links.service';
import { GameSessionsService } from '../game-sessions/game-sessions.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { LinkCreatedBy, LinkStatus } from './patient-hospital-link.schema';
import type { Request } from 'express';

@UseGuards(AuthGuard, RolesGuard)
@Controller('patient-hospital-links')
export class PatientHospitalLinksController {
  constructor(
    private readonly linksService: PatientHospitalLinksService,
    private readonly gameSessionsService: GameSessionsService,
  ) {}

  @Roles(['user'])
  @Post('connect')
  connectHospital(@Body('hospitalId') hospitalId: string, @Req() req: Request) {
    return this.linksService.createLink(
      req.user!.sub,
      hospitalId,
      LinkCreatedBy.PATIENT,
    );
  }

  @Roles(['user'])
  @Get('my-hospitals')
  getMyHospitals(@Req() req: Request) {
    return this.linksService.getMyHospitals(req.user!.sub);
  }

  @Roles(['hospital_admin', 'hospital_staff'])
  @Get('dashboard-stats')
  getDashboardStats(@Req() req: Request) {
    const staffId =
      req.user!.role === 'hospital_staff' ? req.user!.sub : undefined;
    return this.linksService.getDashboardStats(req.user!.hospitalId!, staffId);
  }

  @Roles(['hospital_admin', 'hospital_staff'])
  @Get('patients')
  getPatients(
    @Req() req: Request,
    @Query('status') status?: LinkStatus,
    @Query('search') search?: string,
  ) {
    const staffId =
      req.user!.role === 'hospital_staff' ? req.user!.sub : undefined;
    return this.linksService.getHospitalPatients(
      req.user!.hospitalId!,
      status,
      search,
      staffId,
    );
  }

  // Hospital Admin / Staff inspects specific patient game sessions
  @Roles(['hospital_admin', 'hospital_staff'])
  @Get('patient/:patientId/sessions')
  async getPatientSessions(
    @Param('patientId') patientId: string,
    @Req() req: Request,
  ) {
    const isAuthorized = await this.linksService.verifyActiveRelationship(
      req.user!.hospitalId!,
      patientId,
    );

    if (!isAuthorized) {
      throw new ForbiddenException(
        'Patient is not actively linked to your hospital',
      );
    }

    return this.gameSessionsService.findByUser(patientId);
  }

  @Roles(['hospital_admin'])
  @Patch(':id/assign-staff')
  assignStaff(
    @Param('id') id: string,
    @Body('staffId') staffId: string,
    @Req() req: Request,
  ) {
    return this.linksService.assignStaff(id, staffId, req.user!.hospitalId!);
  }

  @Roles(['hospital_admin'])
  @Patch(':id/verify')
  verifyLink(@Param('id') id: string, @Req() req: Request) {
    return this.linksService.verifyLink(
      id,
      req.user!.sub,
      req.user!.hospitalId!,
    );
  }

  @Roles(['hospital_admin'])
  @Patch(':id/revoke')
  revokeLink(@Param('id') id: string, @Req() req: Request) {
    return this.linksService.revokeLink(id, req.user!.hospitalId!);
  }
}
