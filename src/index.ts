import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import {CseBaseManager} from "./resources/cseBase/cseBase.manager.js";
import {cseConfig} from "./configs/cse.config.js";
import {deleteRoute, getRoute, postRoute, putRoute} from "./bindings/http/routes.js";
import {TypeBoxTypeProvider} from "@fastify/type-provider-typebox";

const server: FastifyInstance = Fastify({}).withTypeProvider<TypeBoxTypeProvider>()

const start = async (): Promise<void>  => {
    try {
        await server.register(getRoute);
        await server.register(postRoute);
        await server.register(putRoute);
        await server.register(deleteRoute);
        await server.listen({ port: 3000 });

        new CseBaseManager(cseConfig.cseName, cseConfig.cseId);
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}
start()
    .then(res => console.log('HTTP server is running on port 3000'))
