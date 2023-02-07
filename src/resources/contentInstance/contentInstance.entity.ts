import {RegularResource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";

@Entity("contentInstance")
export class ContentInstance extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.contentInstance
    })
    ty = resourceTypeEnum.contentInstance;

    @Column()
    con: string

    @Column({default: 0})
    cs: number
}
