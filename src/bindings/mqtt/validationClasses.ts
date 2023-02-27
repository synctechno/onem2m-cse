import {operationEnum} from "../../types/primitives.js";
import {resourceTypeEnum} from "../../types/types.js";
import {IsDate, IsEnum, IsObject, IsOptional, IsString, ValidateIf} from "class-validator";

export class MQTTPayload {
    @IsEnum(operationEnum)
    op: operationEnum

    @IsString()
    to: string

    @IsString()
    fr: string

    @IsString()
    rqi: string

    @IsString()
    rvi: string

    @ValidateIf(o => o.op === operationEnum.CREATE || o.op === operationEnum.UPDATE)
    @IsEnum(resourceTypeEnum)
    ty?: resourceTypeEnum

    @ValidateIf(o => o.op === operationEnum.CREATE || o.op === operationEnum.UPDATE)
    @IsObject()
    pc?: any

    @IsOptional()
    @IsDate()
    ot?: Date
}
