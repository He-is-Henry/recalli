import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { RegisterHospitalDto } from './dto/register-hospital.dto';
import { AuthGuard, Public } from '../auth/auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import type { Request } from 'express';
import { CreateStaffDto } from './dto/create-staff.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  // Public endpoint for self-signup
  @Public()
  @Post('register')
  register(@Body() dto: RegisterHospitalDto) {
    return this.hospitalsService.registerHospital(dto);
  }

  // Public endpoint for patients to search hospitals at signup
  @Public()
  @Get('search')
  search(@Query('q') query: string) {
    return this.hospitalsService.search(query);
  }

  // Hospital Admin fetches their own hospital profile
  @Roles(['hospital_admin'])
  @Get('me')
  getMyHospital(@Req() req: Request) {
    return this.hospitalsService.findByAdminUser(req.user!.sub);
  }

  @Roles(['hospital_admin'])
  @Post('staff')
  createStaff(@Req() req: Request, @Body() dto: CreateStaffDto) {
    return this.hospitalsService.createStaff(req.user!.hospitalId!, dto);
  }

  @Roles(['hospital_admin'])
  @Get('staff')
  getStaff(@Req() req: Request) {
    return this.hospitalsService.getStaff(req.user!.hospitalId!);
  }
}
