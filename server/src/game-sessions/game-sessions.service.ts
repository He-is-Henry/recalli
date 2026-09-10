import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGameSessionDto } from './dto/create-game-session.dto';
import { UpdateGameSessionDto } from './dto/update-game-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { GameSessions, GameSessionsDocument } from './game-sessions.schema';
import { Model, Types } from 'mongoose';
import { GameStatus } from './dto/create-game-session.dto';
import { Levels } from '../levels/levels.schema';

@Injectable()
export class GameSessionsService {
  constructor(
    @InjectModel(GameSessions.name)
    private gameSessionsModel: Model<GameSessionsDocument>,
    @InjectModel(Levels.name) private levelsModel: Model<Levels>,
  ) {}

  async startGame(user: string, level: number, restart?: boolean) {
    const levelDoc = await this.levelsModel.findOne({ level });
    if (!levelDoc) throw new NotFoundException('Level not found');

    const canPlayLevel = await this.canPlayLevel(user, level);
    if (!canPlayLevel.canPlay) {
      throw new BadRequestException(
        `Complete level ${canPlayLevel.prev} first`,
      );
    }

    let session = await this.gameSessionsModel.findOne({
      user: new Types.ObjectId(user),
      level,
      status: GameStatus.PLAYING,
    });

    if (restart || !session) {
      session = await this.gameSessionsModel.create({
        user: new Types.ObjectId(user),
        level,
        status: GameStatus.PLAYING,
        startedAt: new Date(),
        warnings: [],
        found: [],
        clicks: [],
      });
    }

    return {
      level: levelDoc.level,
      grid: levelDoc.grid,
      story: levelDoc.story,
      audio: levelDoc.audio,
      video: levelDoc.video,
      status: session.status,
      found: session.found,
      sessionId: session._id,
      warnings: session.warnings.length,
      totalCorrect: levelDoc.pattern.length,
      startedAt: session.startedAt,
    };
  }

  async canPlayLevel(user: string, level: number) {
    if (level === 1) return { canPlay: true };

    const previousLevelWon = await this.gameSessionsModel.findOne({
      user: new Types.ObjectId(user),
      level: level - 1,
      status: GameStatus.WON,
    });

    if (!previousLevelWon) {
      return { canPlay: false, prev: level - 1 };
    }

    return { canPlay: true };
  }

  async handleClick(user: string, level: number, boxIndex: number) {
    const levelDoc = await this.levelsModel.findOne({ level });
    if (!levelDoc) throw new NotFoundException('Level not found');

    let session = await this.gameSessionsModel.findOne({
      user: new Types.ObjectId(user),
      level,
      status: GameStatus.PLAYING,
    });

    if (!session) {
      session = await this.gameSessionsModel.create({
        user: new Types.ObjectId(user),
        level,
        status: GameStatus.PLAYING,
        startedAt: new Date(),
      });
    }

    if (session.status !== GameStatus.PLAYING) {
      throw new BadRequestException('Game already finished');
    }

    if (session.found.includes(boxIndex)) {
      throw new BadRequestException('Box already found');
    }

    const correct = levelDoc.pattern.includes(boxIndex);
    session.clicks.push({ boxIndex, correct, createdAt: new Date() });

    if (correct) {
      session.found.push(boxIndex);
      if (session.found.length === levelDoc.pattern.length) {
        session.status = GameStatus.WON;
      }
    } else {
      const alreadyClickedWrong = session.warnings.includes(boxIndex);
      session.warnings.push(boxIndex);

      if (alreadyClickedWrong || session.warnings.length >= 3) {
        session.status = GameStatus.LOST;
      }
    }

    // Calculate duration when game ends
    if (
      session.status === GameStatus.WON ||
      session.status === GameStatus.LOST
    ) {
      session.completedAt = new Date();
      session.duration = Math.round(
        (session.completedAt.getTime() - session.startedAt.getTime()) / 1000,
      );
    }

    await session.save();

    return {
      correct,
      level: levelDoc.level,
      grid: levelDoc.grid,
      story: levelDoc.story,
      audio: levelDoc.audio,
      video: levelDoc.video,
      status: session.status,
      found: session.found,
      warnings: session.warnings.length,
      sessionId: session._id,
      duration: session.duration,
    };
  }

  async handleReview(user: string, level: number) {
    const levelDoc = await this.levelsModel.findOne({ level }).select('grid');
    if (!levelDoc) throw new NotFoundException('Level not found');

    const session = await this.gameSessionsModel
      .findOne({
        user: new Types.ObjectId(user),
        level,
        status: GameStatus.WON,
      })
      .sort({ createdAt: -1 });

    if (!session) {
      throw new BadRequestException(
        'No completed winning session available to review',
      );
    }

    return {
      level,
      grid: levelDoc.grid,
      clicks: session.clicks,
      duration: session.duration,
      completedAt: session.completedAt,
    };
  }

  async findByUser(user: string) {
    return this.gameSessionsModel
      .find({ user: new Types.ObjectId(user) })
      .sort({ createdAt: -1 });
  }

  create(createGameSessionDto: CreateGameSessionDto) {
    return this.gameSessionsModel.create(createGameSessionDto);
  }

  findAll() {
    return this.gameSessionsModel.find();
  }

  findOne(user: string, level: number) {
    return this.gameSessionsModel
      .findOne({ level, user: new Types.ObjectId(user) })
      .sort({ createdAt: -1 });
  }

  update(id: string, updateGameSessionDto: UpdateGameSessionDto) {
    return this.gameSessionsModel.findByIdAndUpdate(id, updateGameSessionDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.gameSessionsModel.findByIdAndDelete(id);
  }
}
