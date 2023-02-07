import {RegularResource} from "../baseResource/base.entity.js";
import {accessControlRule, resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";

@Entity("accessControlPolicy")
export class AccessControlPolicy extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.accessControlPolicy
    })
    ty = resourceTypeEnum.accessControlPolicy;

    @Column({
        type: "json",
        nullable: true})
    pv: accessControlRule[]

    @Column({
        type: "json",
        nullable: true})
    pvs: accessControlRule[]
}
