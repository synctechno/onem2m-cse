import {RegularResource} from "../baseResource/base.entity.js";
import {locationInformationType, locationSource, resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";

@Entity("locationPolicy")
export class LocationPolicy extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.locationPolicy
    })
    ty = resourceTypeEnum.locationPolicy;

    @Column()
    los: locationSource //locationSource

    @Column()
    lit: locationInformationType //locationInformationType

    @Column()
    lost: string // locationStatus

    @Column()
    loi: string //locationContainerID

    @Column({nullable: true})
    lon: string //locationContainerName
}
