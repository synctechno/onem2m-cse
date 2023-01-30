import dataSource from '../../database.js'
import {resourceTypeEnum} from "../../types/types.js";
import {operationEnum, requestPrimitive, responsePrimitive} from "../../types/primitives.js";
import {ContainerRepository} from "../container/container.repository.js";
import {ContentInstanceRepository} from "./contentInstance.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {nanoid} from "nanoid";
import {getContentSize} from "../../utils.js";
import {Container} from "../container/container.entity.js";

export class ContentInstanceManager {
    private containerRepository;
    private contentInstanceRepository
    private lookupRepository;

    constructor() {
        this.containerRepository = new ContainerRepository(dataSource);
        this.contentInstanceRepository = new ContentInstanceRepository(dataSource);
        this.lookupRepository = new LookupRepository(dataSource);
    }

    async primitiveHandler(primitive: requestPrimitive, targetResource): Promise<responsePrimitive>{
        if (primitive["m2m:rqp"].op === operationEnum.CREATE){
            const resource: any = primitive["m2m:rqp"]["pc"]["m2m:cin"];
            resource.pi = targetResource.ri;
            resource.rn = 'cin_' + nanoid(8)

            const ri = nanoid(8);
            resource.ri = ri;
            resource.cs = getContentSize(resource.con)

            const data = await this.contentInstanceRepository.save(resource);
            await this.lookupRepository.save({
                ri: ri,
                pi: targetResource.ri,
                structured: targetResource.structured + '/' + primitive["m2m:rqp"].pc["m2m:cin"].rn,
                ty: resourceTypeEnum.contentInstance })

            const parentContainer: Container = await this.containerRepository.findOneBy({ri: targetResource.ri})
            parentContainer.cbs += resource.cs;
            parentContainer.cni ++;
            await this.containerRepository.save(parentContainer)

            return {
                "m2m:rsp":{
                    rsc: 2001,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: primitive["m2m:rqp"].ty,
                    pc: {"m2m:cin": data}
                }
            }
        }
        else if (primitive["m2m:rqp"].op === operationEnum.RETRIEVE){
            let resource;
            if (!targetResource.olla){
                resource = await this.contentInstanceRepository.findOneBy({ri: targetResource.ri});
            } else {
                resource = await this.contentInstanceRepository.findOne(
                    {where: {pi: targetResource.pi},
                    order: {ct: targetResource.olla == 'ol' ? 'ASC' : 'DESC'}});
            }
            return {
                "m2m:rsp":{
                    rsc: 2000,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: targetResource.ty,
                    pc: {"m2m:cin": resource}
                }
            }

        } else if (primitive["m2m:rqp"].op === operationEnum.DELETE){
            const resource = await this.contentInstanceRepository.deleteOne({ri: targetResource.ri});
            return {
                "m2m:rsp":{
                    rsc: 2004,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: targetResource.ty,
                    pc: null
                }
            }
        } else {
            return {
                "m2m:rsp":{
                    rsc: 5000,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    pc: ""
                }
            }
        }
    }

    getResource(ri){
        return this.contentInstanceRepository.findOneBy({ri});
    }
}
