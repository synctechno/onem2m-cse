import {RegularResource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";

@Entity("flexContainer")
export class FlexContainer extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.flexContainer
    })
    ty = resourceTypeEnum.flexContainer;

    @Column({nullable: true})
    cnd: string

    @Column()
    cs: number

    @Column({
        type: "json",
        nullable: true})
    ca: any
}
