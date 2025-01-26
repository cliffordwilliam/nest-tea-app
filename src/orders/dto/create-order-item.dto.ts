import { IsNumber, IsPositive, Max, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsNumber()
  @Min(0)
  readonly orderId: number;

  @IsNumber()
  @Min(0)
  readonly teaId: number;

  @IsNumber()
  @Min(0)
  @Max(10000)
  readonly quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  readonly price: number;
}
