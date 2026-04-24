import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Levels } from './levels.schema';
import { Model } from 'mongoose';
import { GameSessions } from '../game-sessions/game-sessions.schema';

@Injectable()
export class LevelsService {
  constructor(
    @InjectModel(Levels.name) private levelsModel: Model<Levels>,
    @InjectModel(GameSessions.name)
    private gameSessionsModel: Model<GameSessions>,
  ) {}
  async create(createLevelDto: CreateLevelDto) {
    const latestLevel = await this.levelsModel
      .findOne()
      .sort({ level: -1 })
      .select('level');
    if (latestLevel && latestLevel.level !== createLevelDto.level)
      throw new BadRequestException(
        `Next level must follow last level: ${latestLevel.level} - ${latestLevel.level + 1}`,
      );
    return await this.levelsModel.create(createLevelDto);
  }

  findAll() {
    return this.levelsModel.find();
  }

  async findAllPublic(user: string) {
    const levels = await this.levelsModel.find().sort({ level: 1 });
    const sesions = await this.gameSessionsModel.find({ user });

    return levels.map((l) => {
      const foundSession = sesions.find((s) => s.level === l.level);
      const { pattern, ...level } = l.toObject();

      return {
        ...level,
        status: foundSession?.status ?? null,
        progress: foundSession
          ? Math.ceil((foundSession.found.length / pattern.length) * 100)
          : 0,
      };
    });
  }

  findOne(id: string) {
    return this.levelsModel.findById(id);
  }
  findByLevel(level: number) {
    return this.levelsModel.findOne({ level });
  }

  update(id: string, updateLevelDto: UpdateLevelDto) {
    return this.levelsModel.findByIdAndUpdate(id, updateLevelDto);
  }

  remove(id: string) {
    return this.levelsModel.findByIdAndDelete(id);
  }
}
