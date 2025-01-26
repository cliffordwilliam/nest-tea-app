import { Order } from 'src/orders/entities/order.entity';
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
import { Role } from '../enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ enum: Role, default: Role.Regular })
  role: Role;

  @OneToMany(() => Order, (order) => order.user, { cascade: true })
  orders: Order[];

  @BeforeInsert()
  normalizeFields() {
    // trim extra spaces
    this.username = this.username.trim().replace(/\s+/g, ' ');
  }
}
