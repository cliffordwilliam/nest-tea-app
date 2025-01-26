import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  @MinLength(10)
  @MaxLength(255)
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,255}$/, {
    message:
      'Password must contain at least one uppercase letter, one number, and one special character',
  })
  readonly password: string;
}
