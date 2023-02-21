import {RegularResource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js";
import {Column, Entity} from "typeorm";
import {IsArray, IsOptional, IsString} from "class-validator";

@Entity("node")
export class Node extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.node,
    })
    ty? = resourceTypeEnum.node;

    @IsOptional({groups: ['update']})
    @IsString({groups: ['create', 'update']})
    @Column()
    ni: string // nodeID

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    @Column({nullable: true})
    hcl?: string // hostedCSELink

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    @Column({nullable: true})
    mgca?: string //mgmtClientAddress

    @IsOptional({groups: ['create', 'update']})
    @IsArray({groups: ['create', 'update']})
    @Column('varchar',{nullable: true, array: true})
    hael?: string[] //hostedAELinks

    @IsOptional({groups: ['create', 'update']})
    @IsArray({groups: ['create', 'update']})
    @Column('varchar', {nullable: true, array: true})
    hsl?: string[] //hostedServiceLinks

    @Column({nullable: true})
    nid?: string //networkID

    @Column({nullable: true})
    rms: boolean //roamingStatus
}
