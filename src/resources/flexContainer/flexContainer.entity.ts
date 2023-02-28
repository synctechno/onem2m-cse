import {RegularResource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";
import {Equals, IsInt, IsOptional, IsString} from "class-validator";

@Entity("flexContainer")
export class FlexContainer extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.flexContainer
    })
    ty? = resourceTypeEnum.flexContainer;

    @IsString({groups: ['create']})
    @Column()
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

    @Column()
    _prefix: string
}

class ModuleColor extends FlexContainer{
    @Equals('org.onem2m.common.moduleclass.colour', {groups: ['create']})
    declare cnd: string

    @IsOptional({groups: ['update']})
    @IsInt({groups: ['create', 'update']})
    red: number

    @IsOptional({groups: ['update']})
    @IsInt({groups: ['create', 'update']})
    green: number

    @IsOptional({groups: ['update']})
    @IsInt({groups: ['create', 'update']})
    blue: number
}

export const sdtPrefixMap: Record<string, {new(): FlexContainer}> = {
    'cod:color': ModuleColor,
}
