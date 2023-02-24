import {Resource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";
import {Allow, Equals, IsOptional} from "class-validator";

@Entity("contentInstance")
export class ContentInstance extends Resource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.contentInstance
    })
    ty? = resourceTypeEnum.contentInstance;

    @Allow({groups: ['create']})
    @Column("varchar")
    con: any

    @Column({default: 0})
    cs: number

    @IsOptional({groups: ['create']})
    @Equals(null, {groups: ['create']})
    @Column()
    cr?: string
}
