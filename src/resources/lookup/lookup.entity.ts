import {resourceTypeEnum} from "../../types/types.js"
import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity("lookup")
export class Lookup {
    @PrimaryColumn()
    readonly ri: string;
    @Column()
    readonly pi: string;
    @Column()
    readonly structured: string;
    @Column({
        type: "enum",
        enum: resourceTypeEnum
        })
    readonly ty: resourceTypeEnum;
    @Column({nullable: true})
    readonly acpi?: string
    @Column()
    readonly originator: string
}
