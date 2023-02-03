import {RegularResource} from "../baseResource/base.entity.js";
import {
    supportedReleaseVersions,
    resourceTypeEnum
} from "../../types/types.js"
import {resourceType} from "../../types/ts-types.js"
import {Entity, Column} from "typeorm";

@Entity("ae")
export class AE extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.AE
    })
    ty: resourceType;

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

    static getTy(){
        return resourceTypeEnum.AE;
    }
}
