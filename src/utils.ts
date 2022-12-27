import {prefixMapType, resourceTypeEnum} from "./types/types.js";

//contentSize in bytes assuming UTF-8 encoding (1 byte)
export function getContentSize (obj: Object): number{
    let size = 0;
    for (const [key, value] of Object.entries(obj)){
        size += key.length;
        size += value.length;
    }
    return size;
}

//TODO need to complete prefix mapping
export const resourceTypeToPrefix: prefixMapType = new Map([
    [resourceTypeEnum.CSEBase, "m2m:cb"],
    [resourceTypeEnum.AE, "m2m:ae"],
    [resourceTypeEnum.accessControlPolicy, "m2m:acp"],
    [resourceTypeEnum.container, "m2m:cnt"],
    [resourceTypeEnum.contentInstance, "m2m:cin"],
    [resourceTypeEnum.subscription, "m2m:sub"],
    [resourceTypeEnum.flexContainer, "m2m:fcnt"],

    [resourceTypeEnum.delivery, "m2m:x"],
    [resourceTypeEnum.eventConfig, "m2m:x"],
    [resourceTypeEnum.execInstance, "m2m:x"],
    [resourceTypeEnum.group, "m2m:x"],
    [resourceTypeEnum.locationPolicy, "m2m:x"],
])
