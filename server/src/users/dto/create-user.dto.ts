import { IsEmail, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  @IsMongoId()
  hospitalId?: string;
}
