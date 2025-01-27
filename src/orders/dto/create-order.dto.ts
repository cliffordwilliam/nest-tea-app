import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from 'src/orders/dto/create-order-item.dto';

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  readonly orderItems: CreateOrderItemDto[];

  @IsString()
  @MaxLength(255)
  @MinLength(3)
  @IsNotEmpty()
  readonly redirectUrl: string;
}
