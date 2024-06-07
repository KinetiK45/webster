import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import {Users} from "./users";

@Entity('projects')
export class Projects {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 45, nullable: false })
    project_name!: string;

    @Column({ type: 'varchar',length: 256, nullable: false })
    projectImageUrl!: string;

    @ManyToOne(() => Users, (user) => user.projects)
    user!: Users;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', nullable: false })
    updated_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', nullable: false })
    created_at!: Date;
}




