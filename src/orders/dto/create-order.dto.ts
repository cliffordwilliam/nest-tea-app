import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';
import { CreateOrderItemDto } from 'src/orders/dto/create-order-item.dto';

export class CreateOrderDto {
  @IsNumber()
  @Min(0)
  readonly userId: number;

  @IsArray()
  @IsNotEmpty()
  @Type(() => CreateOrderItemDto)
  readonly orderItems: CreateOrderItemDto[];

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  readonly totalPrice: number;
}
