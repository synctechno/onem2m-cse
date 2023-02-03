import {Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {resourceTypeEnum} from "../../types/types.js";

@Entity()
export abstract class Resource {
    @PrimaryColumn()
    ri: string
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
    @Column()
    static readonly ty: resourceTypeEnum;
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
