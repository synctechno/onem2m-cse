import mqtt, {MqttClient} from "mqtt";
import {cseConfig} from "../../configs/cse.config.js";
import {validate} from "class-validator";
import {plainToInstance} from "class-transformer";
import {MQTTPayload} from "./validationClasses.js";
import {requestPrimitiveData, responsePrimitive} from "../../types/primitives.js";
import {cseCore} from "../../index.js";
import {rscEnum} from "../../types/types.js";

export class MQTTClient{
    private readonly connection: MqttClient;

    constructor(url, options){
        this.connection = this.connect(url, options);

        this.connection.on('connect',  () => {
            console.log(`MQTT binding is working on ${url}`)
            this.connection.subscribe(`/oneM2M/req/+/${cseConfig.cseId}/+`)
        })

        this.connection.on('message', async (topic, buf, packet) => {
            const payload: requestPrimitiveData = JSON.parse(buf.toString());
            const obj = plainToInstance<MQTTPayload, Object>(MQTTPayload, payload as Object);
            const validateResult = await validate(obj, {whitelist: true, forbidNonWhitelisted: true })

            if (validateResult.length !== 0){
                const badRequestPayload = makeBadRequestPayload(payload.rqi, payload)
                this.connection.publish(`/oneM2M/rsp/${cseConfig.cseId}/${payload.fr}/json`, JSON.stringify(badRequestPayload))
            } else{
                const resPrimitive: responsePrimitive = await cseCore.primitiveGateway({'m2m:rqp': payload});
                this.connection.publish(`/oneM2M/rsp/${cseConfig.cseId}/${payload.fr}/json`, JSON.stringify(resPrimitive["m2m:rsp"]))
            }
        })
    }
    connect = (url, options)=> {
        return mqtt.connect(url, {
            clientId: `C::${cseConfig.cseId}`,
            clean: false,
            ...options
        })
    }
}

function makeBadRequestPayload(rqi, rvi) {
    return {
        rsc: rscEnum.BAD_REQUEST,
        rqi: rqi ? rqi : null,
        rvi: rvi ? rvi : null,
        ot: new Date()
    }
}
