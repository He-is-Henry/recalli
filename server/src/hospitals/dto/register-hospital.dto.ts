import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterHospitalDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(6)
  adminPassword: string;
}
