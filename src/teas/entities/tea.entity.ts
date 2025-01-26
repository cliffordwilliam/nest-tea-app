import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric.transformer';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Tea {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(), // https://github.com/typeorm/typeorm/issues/873
  })
  price: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl?: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.tea, {
    onDelete: 'SET NULL',
  })
  orderItems: OrderItem[];

  @BeforeInsert()
  normalizeFields() {
    // trim extra spaces
    this.name = this.name.trim().replace(/\s+/g, ' ');
    if (this.description) {
      this.description = this.description.trim().replace(/\s+/g, ' ');
    }
    if (this.imageUrl) {
      this.imageUrl = this.imageUrl.trim().replace(/\s+/g, ' ');
    }
  }
}
