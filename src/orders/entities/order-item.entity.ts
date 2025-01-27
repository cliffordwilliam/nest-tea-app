import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric.transformer';
import { Order } from 'src/orders/entities/order.entity';
import { Tea } from 'src/teas/entities/tea.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Tea, (tea) => tea.orderItems, { onDelete: 'SET NULL' })
  tea: Tea | null;

  @Column({ type: 'int' })
  quantity: number;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(), // https://github.com/typeorm/typeorm/issues/873
  })
  price: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
