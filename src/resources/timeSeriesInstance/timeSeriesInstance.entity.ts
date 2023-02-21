import {Resource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";
import {Allow, IsDate, IsOptional, IsPositive} from "class-validator";

@Entity("timeSeriesInstance")
export class TimeSeriesInstance extends Resource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.timeSeriesInstance
    })
    ty? = resourceTypeEnum.timeSeriesInstance;

    @Allow({groups: ['create']})
    @Column("varchar")
    con: any

    @Column({default: 0})
    cs: number

    @IsOptional({groups: ['create']})
    @IsPositive({groups: ['create']})
    @Column({nullable: true})
    snr?: number //sequenceNr

    @IsDate({groups: ['create']})
    @Column("timestamp")
    dgt: Date //dataGenerationTime TODO: need to fix the type to m2m:absRelTimestamp (union of Timestamp and long)
}
