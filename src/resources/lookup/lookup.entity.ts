import {
    resourceTypeEnum
} from "../../types/types.js"
import {resourceType} from "../../types/ts-types.js"
import {Entity, Column, PrimaryColumn} from "typeorm";

@Entity("lookup")
export class Lookup {
    @PrimaryColumn()
    readonly ri: string;
    @Column()
    readonly path: string;
    @Column({
        type: "enum",
        enum: resourceTypeEnum
        })
    readonly ty: resourceType;
}
