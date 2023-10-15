import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  status: boolean;

  @Column()
  perDayLimit: number;

  @Column()
  totalLimit: number;
}
