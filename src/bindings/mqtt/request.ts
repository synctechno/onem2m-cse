import mqtt from 'mqtt';
import {requestPrimitiveToMqtt} from "./converter.js";

export async function request(primitive){
    const {url, topic, payload} = requestPrimitiveToMqtt(primitive)
    const client  = mqtt.connect(url)

    client.on('connect', function () {
        client.publish(topic, JSON.stringify(payload));
        client.end();
    })
}
