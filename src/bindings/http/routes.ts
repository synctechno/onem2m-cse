import {FastifyInstance} from "fastify";
import {headerSchema} from "./schemas.js";
import {resourceTypeEnum} from "../../types/types.js";
import {httpToPrimitive, responsePrimitiveToHtpp} from "./converter.js";
import {responsePrimitive} from "../../types/primitives.js";
import {cseCore} from "../../index.js";

export const router = (fastify: FastifyInstance, options, done) => {
    fastify.addHook('onRequest', (req, res, done) => {
        if (req.method === 'POST' || req.method === 'PUT'){
            if (req.headers['content-type'] === undefined){
                res.code(400);
            }
            const type = req.headers['content-type'];
            if (type === undefined){
                res.code(400);
            } else {
                if(type.startsWith('application/vnd.onem2m-res+json')){
                    req.headers['content-type'] =
                        req.headers['content-type']!.replace('application/vnd.onem2m-res+json', 'application/json')
                }
            }
        }
        done()
    })
    done()

    fastify.all(`/*`, {
        schema: {
            headers: headerSchema
        }
    }, async (req, res) => {
        let ty: resourceTypeEnum | undefined = undefined;
        if (req.method === 'POST' || req.method === 'PUT'){
            ty = Number(req.headers['content-type']!.split(';ty=')[1]);
        }

        const reqPrimitive = httpToPrimitive(req, ty);

        const resPrimitive: responsePrimitive = await cseCore.primitiveGateway(reqPrimitive);
        const {headers, body, statusCode} = responsePrimitiveToHtpp(resPrimitive);
        res.headers(headers);
        res.code(statusCode || 500).send(body);
    })
    done();
};
