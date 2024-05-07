import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class Users {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 45, unique: true, nullable: false })
    username!: string;

    @Column({ type: 'varchar', length: 70, nullable: false })
    password!: string;

    @Column({ type: 'varchar', length: 256, default: 'default.png', nullable: false })
    photo!: string;

    @Column({ type: 'varchar', length: 256, unique: true, nullable: false })
    email!: string;

    @Column({ type: 'varchar', length: 60, nullable: false })
    full_name!: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' ,nullable: false})
    registered_at!: Date;
}



