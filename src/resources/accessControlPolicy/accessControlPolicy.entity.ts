import {Resource} from "../baseResource/base.entity.js";
import {resourceTypeEnum, setOfACRs} from "../../types/types.js"
import {Column, Entity} from "typeorm";
import {IsNotEmptyObject, IsOptional, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {SetOfACRs} from "../../validationClasses.js";

@Entity("accessControlPolicy")
export class AccessControlPolicy extends Resource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.accessControlPolicy
    })
    ty? = resourceTypeEnum.accessControlPolicy;

    @IsOptional({groups: ['update']})
    @IsNotEmptyObject(undefined, {groups: ['create', 'update']})
    @ValidateNested({groups: ['create', 'update']})
    @Type(() => SetOfACRs)
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
