import {operationEnum, requestPrimitive, responsePrimitive} from "../../types/primitives.js";
import {filterCriteria} from "../../types/types.js";

export function httpToPrimitive(req, ty?): requestPrimitive {
    const methodToOp = {
        "POST": operationEnum.CREATE,
        "GET": operationEnum.RETRIEVE,
        "PUT": operationEnum.UPDATE,
        "DELETE": operationEnum.DELETE
    }
    const op = methodToOp[req.method];
    const urlParts = req.url.split('?');
    let filterCriteria = {};
    if (urlParts[1]){
        const conditions = urlParts[1]?.split('&');

        for (const condition of conditions){
            const parts = condition.split('=');
            const conditionKey = parts[0];
            const conditionValue = parts[1];
            filterCriteria[conditionKey] = conditionValue;
        }
    }

    return {
        "m2m:rqp": {
            op,
            to: pathToTo(urlParts[0]),
            fr: req.headers['x-m2m-origin'],
            ri: req.headers['x-m2m-ri'],
            rvi: req.headers['x-m2m-rvi'],
            ty: ty,
            pc: req.body,
            fc: filterCriteria ? filterCriteria as filterCriteria : undefined
        }
    }
}

export function primitiveToHtpp(primitive: responsePrimitive) {
    // let body;
    // const prefix:any = resourceTypeToPrefix.get(primitive["m2m:rsp"].ty);
    // body = {[prefix]: primitive["m2m:rsp"].pc}
    const body = primitive["m2m:rsp"].pc;

    return {
        headers: {
            "X-M2M-RSC": primitive["m2m:rsp"].rsc,
            "X-M2M-RI": primitive["m2m:rsp"].rqi,
            "X-M2M-RVI": primitive["m2m:rsp"].rvi,
            "X-M2M-OT": primitive["m2m:rsp"].ot
        },
        body: [2000, 2001, 2002, 2004].includes(primitive["m2m:rsp"].rsc) ? body : undefined,
        statusCode: statusCode.get(primitive["m2m:rsp"].rsc)
    }
}

//TS-0009 6.2.2.1 Path component
function pathToTo (path: string): string {
    if (path.startsWith('/_/')){ //absolute
        return '/' + path.substring(2)
    } else if (path.startsWith('/~/')) { //SP-relative
        return path.substring(2)
    } else { //CSE-relative
        return path.substring(1)
    }
}

// TS-0009 Table 6.3.2-1
const statusCode = new Map([
    [2000, 200],
    [2002, 200],
    [2004, 200],
    [2001, 200],
    [1000, 202],
    [1001, 202],
    [1002, 202],
    [4000, 400],
    [4102, 400],
    [4110, 400],
    [4120, 400],
    [4122, 400],
    [4123, 400],
    [4133, 400],
    [4134, 400],
    [4137, 400],
    [4143, 400],
    [6010, 400],
    [6022, 400],
    [6023, 400],
    [6024, 400],
    [4101, 403],
    [4103, 403],
    [5105, 403],
    [5203, 403],
    [5205, 403],
    [4106, 403],
    [4107, 403],
    [4108, 403],
    [4109, 403],
    [4111, 403],
    [4112, 403],
    [4113, 403],
    [4114, 403],
    [4115, 403],
    [4116, 403],
    [4117, 403],
    [4126, 403],
    [4127, 403],
    [4128, 403],
    [4135, 403],
    [4136, 403],
    [4138, 403],
    [4139, 403],
    [5208, 403],
    [5214, 403],
    [5215, 403],
    [5218, 403],
    [5222, 403],
    [6034, 403],
    [4004, 404],
    [4118, 404],
    [4119, 404],
    [4121, 404],
    [4130, 404],
    [4132, 404],
    [5103, 404],
    [5107, 404],
    [6003, 404],
    [6005, 404],
    [4005, 405],
    [5207, 406],
    [4104, 409],
    [4105, 409],
    [4124, 409],
    [4140, 409],
    [5106, 409],
    [5219, 409],
    [5220, 409],
    [6028, 409],
    [6029, 409],
    [4015, 415],
    [5000, 500],
    [5204, 500],
    [5209, 500],
    [5210, 500],
    [5211, 500],
    [5212, 500],
    [5216, 500],
    [5217, 500],
    [5221, 500],
    [5230, 500],
    [5231, 500],
    [5232, 500],
    [6020, 500],
    [6021, 500],
    [6025, 500],
    [6026, 500],
    [6033, 500],
    [4001, 501],
    [4125, 501],
    [5001, 501],
    [5206, 501],
    [4008, 504],
    [6030, 504],
    [6031, 504],
])


