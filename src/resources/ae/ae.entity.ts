import {RegularResource} from "../baseResource/base.entity.js";
import {resourceTypeEnum, supportedReleaseVersions} from "../../types/types.js"
import {Column, Entity} from "typeorm";
import {ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsString} from "class-validator";

@Entity("ae")
export class AE extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.AE
    })
    ty? = resourceTypeEnum.AE;

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    @Column({nullable: true})
    apn?: string

    @IsString({groups: ['create']})
    @Column({nullable: true})
    api: string

    @Column({nullable: true})
    aei?: string

    @IsOptional({groups: ['update']})
    @IsBoolean({groups: ['create', 'update']})
    @Column({nullable: true})
    rr?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    @Column({nullable: true})
    nl?: string;

    @IsOptional({groups: ['update']})
    @IsArray({groups: ['create', 'update']})
    @ArrayNotEmpty({groups: ['create', 'update']})
    @Column("varchar", { array: true, nullable: true })
    srv?: supportedReleaseVersions;
}
