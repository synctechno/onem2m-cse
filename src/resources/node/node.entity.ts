import {RegularResource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js";
import {Column, Entity} from "typeorm";

@Entity("node")
export class Node extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.node,
    })
    ty = resourceTypeEnum.node;

    @Column()
    ni: string // nodeID

    @Column({nullable: true})
    hcl: string // hostedCSELink

    @Column({nullable: true})
    mgca: string //mgmtClientAddress

    @Column('varchar',{nullable: true, array: true})
    hael: string[] //hostedAELinks

    @Column('varchar', {nullable: true, array: true})
    hsl: string[] //hostedServiceLinks

    @Column({nullable: true})
    nid: string //networkID

    @Column({nullable: true})
    rms: boolean //roamingStatus
}
