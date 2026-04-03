import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLevelDto {
  @IsInt()
  level: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  grid: number[];

  @IsArray()
  @ArrayNotEmpty()
  pattern: number[];

  @IsString()
  story: string;

  @IsOptional()
  @IsString()
  video?: string;

  @IsOptional()
  @IsString()
  audio?: string;
}
