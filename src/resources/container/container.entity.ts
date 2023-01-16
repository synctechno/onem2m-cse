import {RegularResource} from "../resource.js";
import {
    resourceTypeEnum
} from "../../types/types.js"
import {resourceType} from "../../types/ts-types.js"
import {Entity, Column} from "typeorm";

@Entity("container")
export class Container extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.container
    })
    ty: resourceType;

    @Column({default: 0})
    cni: number

    @Column({default: 0})
    cbs: number

    @Column({nullable: true})
    li: string
}
