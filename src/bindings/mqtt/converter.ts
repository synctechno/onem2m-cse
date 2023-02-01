import {requestPrimitive} from "../../types/primitives.js";

export function requestPrimitiveToMqtt(requestPrimitive: requestPrimitive){
    let [url, serialization] = requestPrimitive["m2m:rqp"].to.split('?ct=')
    if (!serialization){
        serialization = 'json'
    }
    return {
        url: url,
        topic: '/oneM2M/req/' + requestPrimitive["m2m:rqp"].fr + '/' + requestPrimitive["m2m:rqp"].to + '/' + serialization,
        payload: {
            op: requestPrimitive["m2m:rqp"].op,
            fr: requestPrimitive["m2m:rqp"].fr,
            to: requestPrimitive["m2m:rqp"].to,
            pc: requestPrimitive["m2m:rqp"].pc,
            ot: new Date()
        }
    }
}
