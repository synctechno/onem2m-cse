import {RegularResource} from "../baseResource/base.entity.js";
import {consistencyStrategy, resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";

@Entity("group")
export class Group extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.group
    })
    ty = resourceTypeEnum.group;

    @Column({
        default: resourceTypeEnum.mixed
    })
    mt: resourceTypeEnum //memberType

    @Column({nullable: true})
    spty: string //specializationType

    @Column()
    cnm: number //currentNrOfMembers

    @Column()
    mnm: number //maxNrOfMembers

    @Column("varchar", {array: true})
    mid: string[] //memberIDs

    @Column("varchar", {nullable: true, array: true})
    macp: string[] //membersAccessControlPolicyIDs

    @Column({nullable: true})
    mtv: boolean //memberTypeValidated

    @Column({
        type: "enum",
        enum: consistencyStrategy,
        default: consistencyStrategy.ABANDON_MEMBER
    })
    csy = consistencyStrategy.ABANDON_MEMBER

    @Column({nullable: true})
    gn: string //groupName

    @Column({nullable: true})
    ssi: string //semanticSupportIndicator

    @Column({nullable: true})
    nar: string //notifyAggregation
}
