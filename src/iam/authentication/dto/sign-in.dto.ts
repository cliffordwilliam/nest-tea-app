import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(10)
  @MaxLength(255)
  @IsNotEmpty()
  password: string;
}
