import {prefixMapType, resourceTypeEnum} from "./types/types.js";

//contentSize in bytes assuming UTF-8 encoding (1 byte)
export function getContentSize(data: Object | string): number {
    let size = 0;
    if (typeof (data) == 'object') {
        for (const [key, value] of Object.entries(data)) {
            size += key.length;
            if (typeof (value) == "number") {
                size += 8
            } else if (typeof (value) == "string") {
                size += value.length;
            }
        }
    } else {
        size = data.length;
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
    [resourceTypeEnum.locationPolicy, "m2m:lcp"],
    [resourceTypeEnum.group, "m2m:grp"],

    [resourceTypeEnum.delivery, "m2m:x"],
    [resourceTypeEnum.eventConfig, "m2m:x"],
    [resourceTypeEnum.execInstance, "m2m:x"],
])

export function handleTo(to: string, cseName: string): {
    id: string,
    structured: boolean,
    cseId?: string,
    spId?: string
} | null {
    const parts = to.split('/');
    if (to.startsWith('//')) { //check if absolute
        if (parts.length < 5) {
            return null;
        }
        const spId = '//' + parts[2];
        if (!spId) {
            return null;
        }
        const cseId = parts[3];
        if (!cseId) {
            return null;
        }
        let cseRelativeId = to.split(cseId + '/')[1];
        return {
            id: cseRelativeId,
            structured: isStructured(cseRelativeId),
            cseId,
            spId
        }
    } else if (to.startsWith('/')) { //check if SP-Relative
        if (parts.length < 3) {
            return null;
        }
        const cseId = parts[1];
        if (!cseId) {
            return null;
        }
        let cseRelativeId = to.split(cseId + '/')[1];
        return {
            id: cseRelativeId,
            structured: isStructured(cseRelativeId),
            cseId
        }
    } else { //else CSE-Relative
        let id = to;
        if (parts[0] === '-') { //shortcut address
            id = to.replace('-', cseName)
        }
        return {
            id,
            structured: isStructured(to)
        }
    }

    function isStructured(id) {
        if (id === cseName) {
            return true;
        } else {
            return id.indexOf('/') > -1;
        }
    }
}
