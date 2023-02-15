import {Resource} from "../baseResource/base.entity.js";
import {resourceTypeEnum, setOfACRs} from "../../types/types.js"
import {Column, Entity} from "typeorm";

@Entity("accessControlPolicy")
export class AccessControlPolicy extends Resource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.accessControlPolicy
    })
    ty = resourceTypeEnum.accessControlPolicy;

    @Column({
        type: "json",
        nullable: true
    })
    pv: setOfACRs

    @Column({
        type: "json",
        nullable: true
    })
    pvs: setOfACRs
}
