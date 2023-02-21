import {RegularResource} from "../baseResource/base.entity.js";
import {locationInformationType, locationSource, resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";
import {IsEnum, IsInt, IsOptional, IsString} from "class-validator";

@Entity("locationPolicy")
export class LocationPolicy extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.locationPolicy
    })
    ty? = resourceTypeEnum.locationPolicy;

    @IsEnum(locationSource, {groups: ['create']})
    @Column()
    los: locationSource //locationSource

    @IsOptional({groups: ['create', 'update']})
    @IsEnum(locationInformationType, {groups: ['create', 'update']})
    @Column()
    lit: locationInformationType //locationInformationType

    @Column()
    lost: string // locationStatus

    @Column()
    loi: string //locationContainerID

    @IsOptional({groups: ['create']})
    @IsString({groups: ['create']})
    @Column({nullable: true})
    lon: string //locationContainerName
}
