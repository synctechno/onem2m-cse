import mqtt from 'mqtt';
import {requestPrimitiveToMqtt} from "./converter.js";
import {cseConfig} from "../../configs/cse.config.js";

export async function request(url: string, primitive) {
    let serialization = url.split('?ct=')[1]
    if (!serialization){
        serialization = 'json'
    }
    const {topic, payload} = requestPrimitiveToMqtt(primitive, serialization)
    const client = mqtt.connect(url, {
        clientId: `C::${cseConfig.cseId}`,
        clean: false,
    })

    client.on('connect', function () {
        client.publish(topic, JSON.stringify(payload));
        client.end();
    })
}
