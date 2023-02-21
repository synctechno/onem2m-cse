import {Static, Type} from '@sinclair/typebox'

//TS-0004 6.3.4.2.1	m2m:resourceType
export enum resourceTypeEnum {
    mixed = 0, //used for group memberType only
    accessControlPolicy = 1,
    AE = 2,
    container = 3,
    contentInstance = 4,
    CSEBase = 5,
    // delivery = 6,
    // eventConfig = 7,
    // execInstance = 8,
    group = 9,
    locationPolicy = 10,
    node = 14,
    subscription = 23,
    flexContainer = 28,
    timeSeries = 29,
    timeSeriesInstance = 30
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

export type aeIdStem = `${'S' | 'C'}${string}`

//TS-0004 6.3.3
type serialization = "xml" | "json" | "cbor"
export type serializations = serialization[]

//TS-0004 6.3.3
type supportedReleaseVersion = "1" | "2" | "2a" | "3"
export type supportedReleaseVersions = supportedReleaseVersion[]

//TODO
export type e2eSecInfo = any;

//TS-0004 Table 6.3.5.26 1:
export type setOfACRs = {
    acr: accessControlRule[]
}

//TS-0001 Table 9.6.2.0-3
export type accessControlRule = {
    acor: string[],
    acop: Number,
    acco?: accessControlContexts[],
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

export enum rscEnum {
    ACCEPTED = 1000,
    ACCEPTED_for_nonBlockingRequestSynch = 1001,
    ACCEPTED_for_nonBlockingRequestAsynch = 1002,
    OK = 2000,
    CREATED = 2001,
    DELETED = 2002,
    UPDATED = 2004,
    BAD_REQUEST = 4000,
    RELEASE_VERSION_NOT_SUPPORTED = 4001,
    NOT_FOUND = 4004,
    OPERATION_NOT_ALLOWED = 4005,
    REQUEST_TIMEOUT = 4008,
    UNSUPPORTED_MEDIA_TYPE = 4015,
    SUBSCRIPTION_CREATOR_HAS_NO_PRIVILEGE = 4101,
    CONTENTS_UNACCEPTABLE = 4102,
    ORIGINATOR_HAS_NO_PRIVILEGE = 4103,
    GROUP_REQUEST_IDENTIFIER_EXISTS = 4104,
    CONFLICT = 4105,
    ORIGINATOR_HAS_NOT_REGISTERED = 4106,
    SECURITY_ASSOCIATION_REQUIRED = 4107,
    INVALID_CHILD_RESOURCE_TYPE = 4108,
    NO_MEMBERS = 4109,
    GROUP_MEMBER_TYPE_INCONSISTENT = 4110,
    ESPRIM_UNSUPPORTED_OPTION = 4111,
    ESPRIM_UNKNOWN_KEY_ID = 4112,
    ESPRIM_UNKNOWN_ORIG_RAND_ID = 4113,
    ESPRIM_UNKNOWN_RECV_RAND_ID = 4114,
    ESPRIM_BAD_MAC = 4115,
    ESPRIM_IMPERSONATION_ERROR = 4116,
    ORIGINATOR_HAS_ALREADY_REGISTERED = 4117,
    ONTOLOGY_NOT_AVAILABLE = 4118,
    LINKED_SEMANTICS_NOT_AVAILABLE = 4119,
    INVALID_SEMANTICS = 4120,
    MASHUP_MEMBER_NOT_FOUND = 4121,
    INVALID_TRIGGER_PURPOSE = 4122,
    ILLEGAL_TRANSACTION_STATE_TRANSITION_ATTEMPTED = 4123,
    BLOCKING_SUBSCRIPTION_ALREADY_EXISTS = 4124,
    SPECIALIZATION_SCHEMA_NOT_FOUND = 4125,
    APP_RULE_VALIDATION_FAILED = 4126,
    OPERATION_DENIED_BY_REMOTE_ENTITY = 4127,
    SERVICE_SUBSCRIPTION_NOT_ESTABLISHED = 4128,
    INVALID_SPARQL_QUERY = 4129,
    INTERNAL_SERVER_ERROR = 5000,
    NOT_IMPLEMENTED = 5001,
    TARGET_NOT_REACHABLE = 5103,
    RECEIVER_HAS_NO_PRIVILEGE = 5105,
    ALREADY_EXISTS = 5106,
    REMOTE_ENTITY_NOT_REACHABLE = 5107,
    TARGET_NOT_SUBSCRIBABLE = 5203,
    SUBSCRIPTION_VERIFICATION_INITIATION_FAILED = 5204,
    SUBSCRIPTION_HOST_HAS_NO_PRIVILEGE = 5205,
    NON_BLOCKING_SYNCH_REQUEST_NOT_SUPPORTED = 5206,
    NOT_ACCEPTABLE = 5207,
    DISCOVERY_DENIED_BY_IPE = 5208,
    GROUP_MEMBERS_NOT_RESPONDED = 5209,
    ESPRIM_DECRYPTION_ERROR = 5210,
    ESPRIM_ENCRYPTION_ERROR = 5211,
    SPARQL_UPDATE_ERROR = 5212,
    TARGET_HAS_NO_SESSION_CAPABILITY = 5214,
    SESSION_IS_ONLINE = 5215,
    JOIN_MULTICAST_GROUP_FAILED = 5216,
    LEAVE_MULTICAST_GROUP_FAILED = 5217,
    TRIGGERING_DISABLED_FOR_RECIPIENT = 5218,
    UNABLE_TO_REPLACE_REQUEST = 5219,
    UNABLE_TO_RECALL_REQUEST = 5220,
    CROSS_RESOURCE_OPERATION_FAILURE = 5221,
    TRANSACTION_PROCESSING_IS_INCOMPLETE = 5222,
    EXTERNAL_OBJECT_NOT_REACHABLE = 6003,
    EXTERNAL_OBJECT_NOT_FOUND = 6005,
    MAX_NUMBER_OF_MEMBER_EXCEEDED = 6010,
    MGMT_SESSION_CANNOT_BE_ESTABLISHED = 6020,
    MGMT_SESSION_ESTABLISHMENT_TIMEOUT = 6021,
    INVALID_CMDTYPE = 6022,
    INVALID_ARGUMENTS = 6023,
    INSUFFICIENT_ARGUMENTS = 6024,
    MGMT_CONVERSION_ERROR = 6025,
    MGMT_CANCELLATION_FAILED = 6026,
    ALREADY_COMPLETE = 6028,
    MGMT_COMMAND_NOT_CANCELLABLE = 6029,
    EXTERNAL_OBJECT_NOT_REACHABLE_BEFORE_RQET_TIMEOUT = 6030,
    EXTERNAL_OBJECT_NOT_REACHABLE_BEFORE_OET_TIMEOUT = 6031,
}

//used for internal purposes
export type resultData = {
    pc?: any,
    rsc: rscEnum
} | rscEnum

//TS-0004 Table 6.3.4.2.7 1
export enum resultContent {
    nothing = 0,
    attributes = 1,
    hierarchial_address = 2,
    hierarchial_address_and_attributes = 3,
    attributes_and_child_resources = 4,
    attributes_and_child_resource_references = 5,
    child_resource_references = 6,
    original_resource = 7,
    child_resources = 8,
    modified_attributes = 9,
    semantic_content = 10
}

export enum consistencyStrategy {
    ABANDON_MEMBER = 1,
    ABANDON_GROUP = 2,
    SET_MIXED = 3
}

type atLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]
