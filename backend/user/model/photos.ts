import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import {Users} from "./users";

@Entity('photos')
export class Photos {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 256, nullable: false })
    url!: string;

    @ManyToOne(() => Users, (user) => user.photos)
    user!: Users;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

}
