import {Type} from "@sinclair/typebox";
import {resourceType, resourceTypeEnum} from "./types.js";

export enum operationEnum{
    CREATE = 1,
    RETRIEVE,
    UPDATE,
    DELETE,
    NOTIFY,
    DISCOVERY
}

// export const requestPrimitive = Type.Object({
//     op: Type.Enum(Operation),
//     to: Type.String(),
//     fr: Type.String(),
//     ri: Type.String(),
//     ty: resourceType,
//     pc: Type.String()
// })

export type requestPrimitive = {
    "m2m:rqp": {
        op: operationEnum,
        to: string,
        fr?: string,
        ri: string,
        rvi: string
        ty: resourceTypeEnum,
        pc?: any
    }
}

export type responsePrimitive = {
    "m2m:rsp": {
        "rsc": number,
        "rqi": string,
        "rvi": string,
        "ot"?: Date,
        "pc": any
        "ty"?: any //TODO ty does not exist in response primitive but temporariry needed until code refactoring
    }
}

export interface PrimitiveHandlerI{
    (requestPrimitive): Promise<responsePrimitive>
}
