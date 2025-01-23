import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTeaDto {
  @IsString()
  @MaxLength(255)
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

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  @MaxLength(255)
  @IsOptional()
  readonly imageUrl?: string;
}
