import { Static, Type } from '@sinclair/typebox'

//TS-0004 6.3.4.2.1	m2m:resourceType
export enum resourceTypeEnum {
    mixed = 0, //used for group memberType only
    accessControlPolicy = 1,
    AE = 2,
    container = 3,
    contentInstance = 4,
    CSEBase = 5,
    delivery = 6,
    eventConfig = 7,
    execInstance = 8,
    group = 9,
    locationPolicy = 10,
    subscription = 23,
    flexContainer = 28
}
export const resourceType = Type.Enum(resourceTypeEnum)

//TS-0004 6.3.4.2.2	m2m:cseTypeID
enum cseTypeIDEnum {
    IN_CSE = 1,
    MN_CSE = 2,
    ASN_CSE = 3,
}
const cseTypeID = Type.Enum(cseTypeIDEnum)
export type cseTypeID = Static<typeof cseTypeID>;

//TS-0004 6.3.3
type serialization = "xml" | "json" | "cbor"
export type serializations = serialization[]

//TS-0004 6.3.3
type supportedReleaseVersion = "1" | "2" | "2a" | "3"
export type supportedReleaseVersions = supportedReleaseVersion[]

//TODO
export type e2eSecInfo = any;

//TS-0001 Table 9.6.2.0-3
export type accessControlRule = {
    acor?: accessControlContexts,
    acop?: Number,
    acco?: string,
}

export type accessControlContexts = {
    actw?: string,
    acip?: string
    aclr?: string
}

//TS-0001 Table 9.6.8-3
export type eventNotificationCriteria = {
    crb?: Date //createdBefore
    cra?: Date //createdAfter
    ms?: Date //modifiedSince
    us?: Date //unmodifiedSince
    sts?: number //stateTagSmaller
    stb?: number //stateTagBigger
    exb?: Date //expireBefore
    exa?: Date //expireAfter
    sza?: number //sizeAbove
    szb?: number //sizeBelow
    net?: notificationEventType[] //notificationEventType
    om?: atLeastOne<operationMonitor> //operationMonitor
    atr?: attribute //attribute
    chty?: resourceTypeEnum[] //childResourceType
    md?: missingData //missingData
    fo?: filterOperation //filterOperation
}

export enum notificationEventType {
    UPDATE = 1,
    DELETE,
    CREATE,
    DELETE_CHILD,
    RETRIEVE_CNT_NO_CHILD,
    TRIGGER_FOR_AE,
    BLOCKING_UPDATE,
    REPORT_ON_MISSING_DATA
}

type operationMonitor = {
    ops?: number, //operations
    or?: string, //originator
}

type attribute = {
    nm: string//name
    val: any//value
}

//TS-0004 6.3.5.40	m2m:missingData
type missingData = {
    num: number, //number
    dur: any //duration
}

//TS-0004 6.3.4.2.34	m2m:filterOperation
enum filterOperation {
    AND = 1,
    OR
}

//TODO the type needs to be completed
export type filterCriteria = {
    fu: number //filterUsage
    rcn: number //response content
}

export enum locationSource {
    NETWORK_BASED = 1,
    DEVICE_BASED = 2,
    SHARING_BASED = 3
}

export enum locationInformationType {
    POSITION_FIX = 1,
    GEOFENCE_EVENT = 2,
}

export type prefixMapType = Map<resourceTypeEnum, string>;

type atLeastOne<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]
