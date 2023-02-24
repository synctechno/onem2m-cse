import {RegularResource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";
import {Equals, IsOptional, IsString} from "class-validator";

@Entity("flexContainer")
export class FlexContainer extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.flexContainer
    })
    ty? = resourceTypeEnum.flexContainer;

    @IsString({groups: ['create']})
    @Column({nullable: true})
    cnd: string

    @Column()
    cs: number

    @Column({
        type: "json",
        nullable: true})
    ca: any

    @IsOptional({groups: ['create']})
    @Equals(null, {groups: ['create']})
    @Column({nullable: true})
    cr?: string
}
