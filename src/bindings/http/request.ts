/// <reference lib="dom" />
import {requestPrimitiveToHtpp} from "./converter.js";

export function request(url: string, primitive){
    const {headers, body} = requestPrimitiveToHtpp(primitive)
    return fetch(url, {
        method: "POST",
        headers,
        body
    })
}
