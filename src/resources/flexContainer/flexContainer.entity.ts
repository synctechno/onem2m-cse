import {RegularResource} from "../resource.js";
import {
    resourceTypeEnum
} from "../../types/types.js"
import {resourceType} from "../../types/ts-types.js"
import {Entity, Column} from "typeorm";

@Entity("flexContainer")
export class FlexContainer extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.flexContainer
    })
    ty: resourceType;

    @Column({nullable: true})
    cnd: string

    @Column()
    cs: number

    @Column({
        type: "json",
        nullable: true})
    ca: any
}
