import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Levels } from './levels.schema';
import { Model } from 'mongoose';
import { GameSessions } from '../game-sessions/game-sessions.schema';
import { GameStatus } from '../game-sessions/dto/create-game-session.dto';

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
    return this.levelsModel.find().sort({ level: 1 });
  }

  async findAllPublic(user: string) {
    const levels = await this.levelsModel.find().sort({ level: 1 });
    const sessions = await this.gameSessionsModel.find({ user });

    return levels.map((l) => {
      const wonSessions = sessions.filter(
        (s) => s.level === l.level && s.status === GameStatus.WON,
      );

      const foundSession =
        wonSessions[0] ?? sessions.find((s) => s.level === l.level);

      const { pattern, ...level } = l.toObject();

      const totalPattern = pattern?.length ?? 0;
      const foundTiles = foundSession?.found?.length ?? 0;

      const progress =
        totalPattern > 0 ? Math.ceil((foundTiles / totalPattern) * 100) : 0;

      const bestTime =
        wonSessions.length > 0
          ? Math.min(...wonSessions.map((s) => s.duration ?? Infinity))
          : null;

      return {
        ...level,
        status: foundSession?.status ?? null,
        progress,
        bestTime: bestTime === Infinity ? null : bestTime,
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
    delete updateLevelDto.level;
    return this.levelsModel.findByIdAndUpdate(id, updateLevelDto);
  }

  async remove(id: string) {
    const latestLevel = await this.levelsModel
      .findOne()
      .sort({ level: -1 })
      .select('level');
    if (id !== latestLevel?._id.toString())
      throw new BadRequestException(
        'Can only delete latest level, update this level instead',
      );
    return this.levelsModel.findByIdAndDelete(id);
  }
}
