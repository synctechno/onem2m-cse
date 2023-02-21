import {accessControlContexts, accessControlRule, notificationEventType} from "./types/types.js";
import {IsDate, IsEnum, IsNotEmptyObject, IsOptional, IsPositive, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";


export class SetOfACRs{
    @IsNotEmptyObject(undefined, {each: true, groups: ['create', 'update']})
    @ValidateNested({each: true, groups: ['create', 'update']})
    @Type(() => AccessControlRule)
    acr: accessControlRule[]
}

class AccessControlRule{
    @IsString({each: true, groups: ['create', 'update']})
    acor: string[]

    @IsPositive({groups: ['create', 'update']})
    acop: Number

    @IsOptional({groups: ['create', 'update']})
    @IsNotEmptyObject(undefined, {each: true, groups: ['create', 'update']})
    @ValidateNested({each: true, groups: ['create', 'update']})
    @Type(() => AccessControlContexts)
    acco?: accessControlContexts[]
}

class AccessControlContexts{
    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    actw?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    acip?: string

    @IsOptional({groups: ['create', 'update']})
    @IsString({groups: ['create', 'update']})
    aclr?: string
}

export class EventNotificationCriteria{
    @IsOptional({groups: ['create', 'update']})
    @IsDate({groups: ['create', 'update']})
    crb?: Date //createdBefore

    @IsOptional({groups: ['create', 'update']})
    @IsDate({groups: ['create', 'update']})
    cra?: Date //createdAfter

    @IsOptional({groups: ['create', 'update']})
    @IsDate({groups: ['create', 'update']})
    ms?: Date //modifiedSince

    @IsOptional({groups: ['create', 'update']})
    @IsDate({groups: ['create', 'update']})
    us?: Date //unmodifiedSince

    @IsOptional({groups: ['create', 'update']})
    @IsPositive({groups: ['create', 'update']})
    sts?: number //stateTagSmaller

    @IsPositive({groups: ['create', 'update']})
    @IsOptional({groups: ['create', 'update']})
    stb?: number //stateTagBigger

    @IsDate({groups: ['create', 'update']})
    @IsOptional({groups: ['create', 'update']})
    exb?: Date //expireBefore

    @IsDate({groups: ['create', 'update']})
    @IsOptional({groups: ['create', 'update']})
    exa?: Date //expireAfter

    @IsPositive({groups: ['create', 'update']})
    @IsOptional({groups: ['create', 'update']})
    sza?: number //sizeAbove

    @IsPositive({groups: ['create', 'update']})
    @IsOptional({groups: ['create', 'update']})
    szb?: number //sizeBelow

    @IsEnum(notificationEventType, {each: true, groups: ['create', 'update']})
    @IsOptional({groups: ['create', 'update']})
    net?: notificationEventType[] //notificationEventType

    // @IsOptional({groups: ['create', 'update']})
    // om?: atLeastOne<operationMonitor> //operationMonitor
    //
    // @IsOptional({groups: ['create', 'update']})
    // atr?: attribute //attribute
    //
    // @IsOptional({groups: ['create', 'update']})
    // chty?: resourceTypeEnum[] //childResourceType
    //
    // @IsOptional({groups: ['create', 'update']})
    // md?: missingData //missingData
    //
    // @IsOptional({groups: ['create', 'update']})
    // fo?: filterOperation //filterOperation
}
