import {RegularResource} from "../baseResource/base.entity.js";
import {cseTypeID, e2eSecInfo, resourceTypeEnum, serializations, supportedReleaseVersions} from "../../types/types.js"
import {Column, Entity} from "typeorm";

@Entity("cseBase")
export class CseBase extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.CSEBase
        })
    ty = resourceTypeEnum.CSEBase;
    @Column({nullable: true})
    cst?: cseTypeID;
    @Column({nullable: true})
    csi?: string;
    @Column("varchar", { array: true, nullable: true })
    srt?: resourceTypeEnum[];
    @Column("varchar", { array: true, nullable: true })
    poa?: string[];
    @Column({nullable: true})
    nl?: string;
    @Column("varchar", { array: true, nullable: true })
    csz?: serializations;
    @Column("varchar", {nullable: true})
    esi?: e2eSecInfo; //e2eSecInfo is not defined yet
    @Column("varchar", { array: true, nullable: true })
    srv?: supportedReleaseVersions;
}
