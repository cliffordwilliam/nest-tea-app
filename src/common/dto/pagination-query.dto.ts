import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100) // prevent too much items in 1 req
  @Transform(({ value }) => (value ? Number(value) : 10))
  readonly limit?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  // no max, can offset till whatever
  @Transform(({ value }) => (value ? Number(value) : 0))
  readonly offset?: number;
}
