import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTeaDto {
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  @IsOptional()
  readonly description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  readonly price: number;

  @IsNumber()
  @Min(0)
  @Max(10000)
  readonly stock: number;
}
