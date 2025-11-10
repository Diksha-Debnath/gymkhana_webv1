import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  hostingAuthority!: string;

  @Column()
  venue!: string;

  @Column()
  startTime!: string;

  @Column()
  endTime!: string;

  @Column()
  description!: string;

  @Column({ nullable: true })
  registrationForm?: string;

  @ManyToOne(() => User)
  @JoinColumn()
  host!: User;
}
