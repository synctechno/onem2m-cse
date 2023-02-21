import {RegularResource} from "../baseResource/base.entity.js";
import {consistencyStrategy, resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";
import {IsArray, IsEnum, IsInt, IsOptional, IsString} from "class-validator";

@Entity("group")
export class Group extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.group
    })
    ty? = resourceTypeEnum.group;

    @IsOptional({groups: ['create', 'update']})
    @IsEnum(resourceTypeEnum,{groups: ['create']})
    @Column({
        default: resourceTypeEnum.mixed
    })
    mt: resourceTypeEnum //memberType

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create']})
    @Column({nullable: true})
    spty: string //specializationType

    @Column()
    cnm: number //currentNrOfMembers

    @Column()
    mnm: number //maxNrOfMembers

    @IsOptional({groups: ['update']})
    @IsArray({groups: ['create', 'update']})
    @Column("varchar", {array: true})
    mid: string[] //memberIDs

    @IsOptional({groups: ['create', 'update']})
    @IsArray({groups: ['create', 'update']})
    @Column("varchar", {nullable: true, array: true})
    macp: string[] //membersAccessControlPolicyIDs

    @Column({nullable: true})
    mtv: boolean //memberTypeValidated

    @IsOptional({groups: ['create']})
    @IsString({groups: ['create']})
    @Column({
        type: "enum",
        enum: consistencyStrategy,
        default: consistencyStrategy.ABANDON_MEMBER
    })
    csy = consistencyStrategy.ABANDON_MEMBER

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    @Column({nullable: true})
    gn: string //groupName

    // @Column({nullable: true})
    // ssi: string //semanticSupportIndicator

    // @Column({nullable: true})
    // nar: string //notifyAggregation
}
