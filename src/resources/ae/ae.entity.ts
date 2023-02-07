import {RegularResource} from "../baseResource/base.entity.js";
import {resourceTypeEnum, supportedReleaseVersions} from "../../types/types.js"
import {Column, Entity} from "typeorm";

@Entity("ae")
export class AE extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.AE
    })
    ty = resourceTypeEnum.AE;

    @Column({nullable: true})
    api: string

    @Column({nullable: true})
    aei: string

    @Column({nullable: true})
    rr: string

    @Column({nullable: true})
    nl?: string;

    @Column("varchar", { array: true, nullable: true })
    srv?: supportedReleaseVersions;
}
