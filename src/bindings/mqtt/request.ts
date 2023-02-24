import mqtt from 'mqtt';
import {requestPrimitiveToMqtt} from "./converter.js";
import {cseConfig} from "../../configs/cse.config.js";

export async function request(primitive) {
    const {url, topic, payload} = requestPrimitiveToMqtt(primitive)
    const client = mqtt.connect(url, {
        clientId: `C::${cseConfig.cseId}`,
        clean: false,
    })

    client.on('connect', function () {
        client.publish(topic, JSON.stringify(payload));
        client.end();
    })
}
