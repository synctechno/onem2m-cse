import {RegularResource} from "../resource.js";
import {
    locationInformationType,
    locationSource,
    resourceTypeEnum
} from "../../types/types.js"
import {resourceType} from "../../types/ts-types.js"
import {Entity, Column} from "typeorm";

@Entity("locationPolicy")
export class LocationPolicy extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.locationPolicy
    })
    ty: resourceType;

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
