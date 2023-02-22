import 'reflect-metadata';
import Fastify, {FastifyInstance} from 'fastify';
import {router} from "./bindings/http/routes.js";
import {TypeBoxTypeProvider} from "@fastify/type-provider-typebox";
import {CseCore} from "./cseCore.js";

const server: FastifyInstance = Fastify({logger: true}).withTypeProvider<TypeBoxTypeProvider>()
export const cseCore = new CseCore();

const start = async (): Promise<void>  => {
    try {
        await server.register(router);
        await server.listen({ port: 3000 });
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}
start()
    .then(res => console.log('HTTP server is running on port 3000'))
