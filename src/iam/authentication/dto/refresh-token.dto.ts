import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @MaxLength(1024)
  @IsNotEmpty()
  readonly refreshToken: string;
}
