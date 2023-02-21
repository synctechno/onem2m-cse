import {RegularResource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js";
import {Column, Entity} from "typeorm";

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
}
