import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGameSessionDto } from './dto/create-game-session.dto';
import { UpdateGameSessionDto } from './dto/update-game-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { GameSessions } from './game-sessions.schema';
import { Model } from 'mongoose';
import { GameStatus } from './dto/create-game-session.dto';
import { Levels } from '../levels/levels.schema';

@Injectable()
export class GameSessionsService {
  constructor(
    @InjectModel(GameSessions.name)
    private gameSessionsModel: Model<GameSessions>,
    @InjectModel(Levels.name) private levelsModel: Model<Levels>,
  ) {}

  async startGame(user: string, level: number, restart?: boolean) {
    const levelDoc = await this.levelsModel.findOne({ level });
    if (!levelDoc) throw new NotFoundException();
    let session = await this.findOne(user, level);

    if (!session) {
      session = await this.create({
        user,
        level,
      });
    }

    if (restart)
      await this.update(session.id, {
        warnings: [],
        found: [],
        status: GameStatus.PLAYING,
      });
    return {
      level: levelDoc.level,
      grid: levelDoc.grid,
      story: levelDoc.story,
      audio: levelDoc.audio,
      video: levelDoc.video,
      status: session.status,
      found: session.found,
      warnings: session.warnings,
      sessionId: session._id,
    };
  }

  async handleClick(user: string, level: number, boxIndex: number) {
    const levelDoc = await this.levelsModel.findOne({ level });
    if (!levelDoc) throw new NotFoundException();
    let session = await this.findOne(user, level);

    if (!session) {
      session = await this.create({
        user,
        level,
      });
    }
    if (session.status !== GameStatus.PLAYING) {
      throw new BadRequestException('Game already finished');
    }
    if (session.found.includes(boxIndex) || session.warnings.includes(boxIndex))
      throw new BadRequestException();
    const correct = levelDoc.pattern.includes(boxIndex);

    if (correct) {
      session.found.push(boxIndex);
      if (session.found.length === levelDoc.pattern.length)
        session.status = GameStatus.WON;
    } else {
      session.warnings.push(boxIndex);
      if (session.warnings.length === 3) session.status = GameStatus.LOST;
    }

    await session.save();
    return {
      level: levelDoc.level,
      grid: levelDoc.grid,
      story: levelDoc.story,
      audio: levelDoc.audio,
      video: levelDoc.video,
      status: session.status,
      found: session.found,
      warnings: session.warnings,
      sessionId: session._id,
    };
  }

  create(createGameSessionDto: CreateGameSessionDto) {
    return this.gameSessionsModel.create(createGameSessionDto);
  }

  findAll() {
    return this.gameSessionsModel.find();
  }

  findOne(user: string, level: number) {
    return this.gameSessionsModel.findOne({ level, user });
  }

  findUserSessions(user: string) {
    return this.gameSessionsModel.find({ user });
  }

  update(id: string, updateGameSessionDto: UpdateGameSessionDto) {
    return this.gameSessionsModel.findByIdAndUpdate(id, updateGameSessionDto);
  }

  remove(id: string) {
    return this.gameSessionsModel.findByIdAndDelete(id);
  }
}
