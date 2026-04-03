import { IsArray, IsEnum, IsInt, IsMongoId, IsOptional } from 'class-validator';

export enum GameStatus {
  PLAYING = 'playing',
  WON = 'won',
  LOST = 'lost',
}

export class CreateGameSessionDto {
  @IsInt()
  level: number;

  @IsMongoId()
  user: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  found?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  warnings?: number[];

  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;
}
