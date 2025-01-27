import { IsNumber, Max, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsNumber()
  @Min(0)
  readonly teaId: number;

  @IsNumber()
  @Min(1)
  @Max(10000)
  readonly quantity: number;
}
