import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from 'src/orders/dto/create-order-item.dto';

export class CreateOrderDto {
  @IsNumber()
  @Min(0)
  readonly userId: number;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  readonly orderItems: CreateOrderItemDto[];
}
