import {Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {resourceTypeEnum} from "../../types/types.js";
import {IsArray, IsOptional, IsString} from "class-validator";
import {Exclude} from "class-transformer";

@Exclude()
@Entity()
export abstract class Resource {
    @PrimaryColumn()
    public ri: string

    @IsOptional({groups: ['create']})
    @IsString({groups: ['create']})
    @Column("varchar", {nullable: true})
    public readonly rn: string;

    @Column()
    pi: string;

    @CreateDateColumn()
    readonly ct?: Date;

    @UpdateDateColumn({nullable: true})
    readonly lt?: Date; //lastModifiedTime

    @IsOptional({groups: ['create', 'update']})
    @IsArray({groups: ['create', 'update']})
    @Column('varchar',{nullable: true, array: true})
    readonly lbl?: string[];

    @Exclude()
    ty?: resourceTypeEnum;
}

@Entity()
export abstract class RegularResource extends Resource {
    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    @Column({nullable: true})
    acpi?: string;

    @Column({nullable: true})
    et?: Date;

    @Column({nullable: true})
    daci?: string //dynamicAuthorizationConsultationId
}
