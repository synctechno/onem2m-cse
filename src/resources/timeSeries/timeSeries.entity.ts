import {RegularResource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js";
import {Column, Entity} from "typeorm";
import {Equals, IsOptional} from "class-validator";

@Entity("timeSeries")
export class TimeSeries extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.timeSeries,
    })
    ty? = resourceTypeEnum.timeSeries;

    @Column({default: 0})
    cni: number

    @Column({default: 0})
    cbs: number

    @IsOptional({groups: ['create']})
    @Equals(null, {groups: ['create']})
    @Column({nullable: true})
    cr?: string
}
