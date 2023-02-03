import {RegularResource} from "../baseResource/base.entity.js";
import {
    resourceTypeEnum
} from "../../types/types.js"
import {resourceType} from "../../types/ts-types.js"
import {Entity, Column} from "typeorm";

@Entity("contentInstance")
export class ContentInstance extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.contentInstance
    })
    ty: resourceType;

    @Column()
    con: string

    @Column({default: 0})
    cs: number

    static getTy(){
        return resourceTypeEnum.contentInstance;
    }
}
