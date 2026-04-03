import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LevelsService } from './levels.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import type { Request } from 'express';

@UseGuards(AuthGuard, RolesGuard)
@Roles(['admin'])
@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Post()
  create(@Body() createLevelDto: CreateLevelDto) {
    return this.levelsService.create(createLevelDto);
  }

  @Roles(['user', 'admin'])
  @Get('')
  findAllPublic(@Req() request: Request) {
    return this.levelsService.findAllPublic(request.user!.sub);
  }

  @Get('all')
  findAll() {
    return this.levelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.levelsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateLevelDto) {
    return this.levelsService.update(id, updateLevelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.levelsService.remove(id);
  }
}
