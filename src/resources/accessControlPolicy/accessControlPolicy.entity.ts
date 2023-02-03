import {RegularResource} from "../baseResource/base.entity.js";
import {
    resourceTypeEnum, accessControlRule
} from "../../types/types.js"
import {resourceType} from "../../types/ts-types.js"
import {Entity, Column} from "typeorm";

@Entity("accessControlPolicy")
export class AccessControlPolicy extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.accessControlPolicy
    })
    ty: resourceType;

    @Column({
        type: "json",
        nullable: true})
    pv: accessControlRule[]

    @Column({
        type: "json",
        nullable: true})
    pvs: accessControlRule[]

    static getTy(){
        return resourceTypeEnum.accessControlPolicy;
    }
}
