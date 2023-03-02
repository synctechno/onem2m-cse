import {RegularResource} from "../baseResource/base.entity.js";
import {resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";
import {
    Equals,
    IsArray,
    IsInt,
    IsNotEmptyObject,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested
} from "class-validator";
import {Type} from "class-transformer";

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
        nullable: true
    })
    ca: any

    @IsOptional({groups: ['create']})
    @Equals(null, {groups: ['create']})
    @Column({nullable: true})
    cr?: string

    @Column()
    _prefix: string
}

class ModuleColor extends FlexContainer {
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

class PWSContent {
    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    identifier?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    sender?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    sent?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    status?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    msgType?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    scope?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    event?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    urgency?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    severity?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    certainty?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    circle?: string

    @IsOptional({groups: ['create', 'update']})
    @IsArray({groups: ['create', 'update']})
    polygon?: any[]

    @IsOptional({groups: ['create', 'update']})
    @IsNumber({allowNaN: false, allowInfinity: false}, {groups: ['create', 'update']})
    Latitude?: number

    @IsOptional({groups: ['create', 'update']})
    @IsNumber({allowNaN: false, allowInfinity: false}, {groups: ['create', 'update']})
    Longitude?: number

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    magnitude?: number

    @IsOptional({groups: ['create', 'update']})
    @IsObject({groups: ['create', 'update']})
    intensityGridSpec?: object

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    intensityGrid?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    IntensityGridURI?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    DocCode?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    AreaPredictedArrivalTimeNHeight?: string
}

class ModulePWSMessage extends FlexContainer {
    @Equals('org.onem2m.common.moduleclass.pwsmessage', {groups: ['create']})
    declare cnd: string

    @IsOptional({groups: ['create']})
    @IsNotEmptyObject(undefined, {groups: ['create', 'update']})
    @ValidateNested({groups: ['create', 'update']})
    @Type(() => PWSContent)
    content: PWSContent
}

export const sdtPrefixMap: Record<string, { new(): FlexContainer }> = {
    'cod:color': ModuleColor,
    'psft:pwsm': ModulePWSMessage
}
