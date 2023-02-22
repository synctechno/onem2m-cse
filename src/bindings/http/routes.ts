import {headerSchema} from "./schemas.js";
import {resourceTypeEnum} from "../../types/types.js";
import {httpToPrimitive, primitiveToHtpp} from "./converter.js";
import {responsePrimitive} from "../../types/primitives.js";
import {cseCore} from "../../index.js";

export const router = (fastify, options, done) => {
    fastify.all(`/*`, {
        schema: {
            headers: headerSchema
        }
    }, async (req, res) => {
        let ty: resourceTypeEnum | undefined = undefined;
        if (req.method === 'POST' || req.method === 'PUT'){
            ty = Number(req.headers['content-type'].split(';ty=')[1]);
        }

        const reqPrimitive = httpToPrimitive(req, ty);

        const resPrimitive: responsePrimitive = await cseCore.primitiveGateway(reqPrimitive);
        const {headers, body, statusCode} = responsePrimitiveToHtpp(resPrimitive);
        res.headers = headers;
        res.code(statusCode).send(body);
    })
    done();
};
