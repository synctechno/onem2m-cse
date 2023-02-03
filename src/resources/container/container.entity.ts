import {Resource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js";
import {resourceType} from "../../types/ts-types.js";
import {Column, Entity} from "typeorm";

@Entity("container")
export class Container extends Resource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.container
    })
    public static ty: resourceType;

    @Column({default: 0})
    cni: number

    @Column({default: 0})
    cbs: number

    @Column({nullable: true})
    li: string

    static getTy(){
        return resourceTypeEnum.container;
    }
}
