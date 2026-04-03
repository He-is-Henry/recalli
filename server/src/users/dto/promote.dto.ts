import { IsEmail } from 'class-validator';

export class PromoteDto {
  @IsEmail()
  email: string;
}
