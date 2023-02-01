import {Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {nanoid} from "nanoid";
import {resourceTypeEnum} from "../types/types";

@Entity()
export abstract class Resource {
    @PrimaryColumn({ default: nanoid(8) })
    readonly ri: string
    @Column("varchar", {nullable: true})
    readonly rn: string;
    @Column()
    readonly pi: string;
    @CreateDateColumn()
    readonly ct: Date;
    @UpdateDateColumn({nullable: true})
    readonly lmt?: Date; //lastModifiedTime
    @Column({nullable: true})
    readonly lbl?: string;
}

@Entity()
export abstract class RegularResource extends Resource {
    @Column({nullable: true})
    acpi?: string;
    @Column({nullable: true})
    et?: Date;
    @Column({nullable: true})
    daci?: string //dynamicAuthorizationConsultationId
}
