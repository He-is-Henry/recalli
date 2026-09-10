import { IsOptional, IsString } from 'class-validator';

export class CreateHospitalDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;
}
