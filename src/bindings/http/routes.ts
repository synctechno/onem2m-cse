import {cseConfig} from "../../configs/cse.config.js";
import {headerSchema} from "./schemas.js";
import dataSource from '../../database.js'
import {resourceTypeEnum} from "../../types/types.js";
import {CseBaseManager} from "../../resources/cseBase/cseBase.manager.js";
import {httpToPrimitive, primitiveToHtpp} from "../../coverters.js";
import {responsePrimitive} from "../../types/primitives.js";
import {Dispatcher} from "../../dispatcher.js";


const dispatcher = new Dispatcher();

export const getRoute = (fastify, options, done) => {
    fastify.get(`/*`, {
        schema: {
            headers: headerSchema
        }
    }, async (req, res) => {
        const reqPrimitive = httpToPrimitive(req);

        const resPrimitive: responsePrimitive = await dispatcher.process(reqPrimitive);
        const {headers, body, statusCode} = primitiveToHtpp(resPrimitive);
        res.headers = headers;
        res.code(statusCode).send(body);
    })
    done();
};


export const postRoute = (fastify, options, done) => {
    fastify.post(`/*`, {
        schema: {
            headers: headerSchema
        }
    }, async (req, res) => {
        const ty: resourceTypeEnum = Number(req.headers['content-type'].split(';ty=')[1]);
        const reqPrimitive = httpToPrimitive(req, ty, );

        const resPrimitive: responsePrimitive = await dispatcher.process(reqPrimitive);
        const {headers, body, statusCode} = primitiveToHtpp(resPrimitive);
        res.headers = headers;
        res.code(statusCode).send(body);
    })
    done();
};

export const putRoute = (fastify, options, done) => {
    fastify.put(`/*`, {
        schema: {
            headers: headerSchema
        }
    }, async (req, res) => {
        const ty: resourceTypeEnum = Number(req.headers['content-type'].split(';ty=')[1]);
        const reqPrimitive = httpToPrimitive(req, ty, );

        const resPrimitive: responsePrimitive = await dispatcher.process(reqPrimitive);
        const {headers, body} = primitiveToHtpp(resPrimitive);
        res.headers = headers;
        res.send(body);
    })
    done();
};

export const deleteRoute = (fastify, options, done) => {
    fastify.delete(`/*`, {
        schema: {
            headers: headerSchema
        }
    }, async (req, res) => {
        const reqPrimitive = httpToPrimitive(req, null, );

        const resPrimitive: responsePrimitive = await dispatcher.process(reqPrimitive);
        const {headers, body} = primitiveToHtpp(resPrimitive);
        res.headers = headers;
        res.send(body);
    })
    done();
};

