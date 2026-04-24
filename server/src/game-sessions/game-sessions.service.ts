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
    const canPlayLevel = await this.canPlayLevel(user, level);
    if (!canPlayLevel.canPlay)
      throw new BadRequestException(
        `Complete level ${canPlayLevel.prev} first`,
      );
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
        clicks: [],
      });
    return {
      level: levelDoc.level,
      grid: levelDoc.grid,
      story: levelDoc.story,
      audio: levelDoc.audio,
      video: levelDoc.video,
      status: session.status,
      found: session.found,
      sessionId: session._id,
    };
  }

  async canPlayLevel(user: string, level: number) {
    const previousLevel = await this.gameSessionsModel.findOne({
      user,
      level: level - 1,
    });
    if (!previousLevel) return { canPlay: true };
    const prev = previousLevel.level;
    if (previousLevel.status !== GameStatus.WON) {
      return { canPlay: false, prev };
    }
    return { canPlay: true };
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

    if (session.found.includes(boxIndex)) throw new BadRequestException();

    const correct = levelDoc.pattern.includes(boxIndex);
    session.clicks.push({ boxIndex, correct, createdAt: new Date() });

    if (correct) {
      session.found.push(boxIndex);
      if (session.found.length === levelDoc.pattern.length)
        session.status = GameStatus.WON;
    } else {
      const alreadyClickedWrong = session.warnings.includes(boxIndex);
      session.warnings.push(boxIndex);

      if (alreadyClickedWrong) {
        session.status = GameStatus.LOST;
      }
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
      sessionId: session._id,
    };
  }

  async handleReview(user: string, level: number) {
    const levelDoc = await this.levelsModel.findOne({ level }).select('grid');
    if (!levelDoc) throw new NotFoundException();
    const session = await this.findOne(user, level).select('status clicks');
    if (!session) throw new NotFoundException();
    if (session.status !== GameStatus.WON)
      throw new BadRequestException('Cannot review yet');

    const { clicks } = session;
    return {
      level,
      grid: levelDoc.grid,
      clicks,
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
