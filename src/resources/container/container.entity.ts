import {RegularResource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js";
import {Column, Entity} from "typeorm";
import {Equals, IsOptional} from "class-validator";

@Entity("container")
export class Container extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.container,
    })
    ty? = resourceTypeEnum.container;

    @Column({default: 0})
    cni: number

    @Column({default: 0})
    cbs: number

    @Column({nullable: true})
    li: string

    @IsOptional({groups: ['create']})
    @Equals(null, {groups: ['create']})
    @Column({nullable: true})
    cr?: string
}
