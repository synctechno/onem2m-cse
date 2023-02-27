import {requestPrimitive} from "../../types/primitives.js";

export function requestPrimitiveToMqtt(requestPrimitive: requestPrimitive, serialization){
    return {
        topic: '/oneM2M/req/' + requestPrimitive["m2m:rqp"].fr + '/' + requestPrimitive["m2m:rqp"].to + '/' + serialization,
        payload: requestPrimitive["m2m:rqp"].pc ? requestPrimitive["m2m:rqp"].pc : {}
    }
}
