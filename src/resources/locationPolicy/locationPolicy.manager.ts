import dataSource from '../../database.js'
import {resourceTypeEnum, resultData, rscEnum as rsc} from "../../types/types.js";
import {operationEnum} from "../../types/primitives.js";
import {LocationPolicyRepository} from "./locationPolicy.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {nanoid} from "nanoid";
import {ContainerRepository} from "../container/container.repository.js";

export class LocationPolicyManager {
    private locationPolicyRepository;
    private containerRepository;
    private lookupRepository;

    constructor() {
        this.locationPolicyRepository = new LocationPolicyRepository(dataSource);
        this.containerRepository = new ContainerRepository(dataSource);
        this.lookupRepository = new LookupRepository(dataSource);
    }

    async handleRequest(op: operationEnum, pc?, targetResource?): Promise<resultData>{
        switch (op) {
            case operationEnum.CREATE:{
                const resource: any = pc["m2m:lcp"];
                resource.pi = targetResource.ri;

                const ri = nanoid(8);
                resource.ri = ri;
                resource.lost = "normal"

                const containerRi = nanoid(8);
                resource.loi = containerRi;

                const containerName = resource.lon ? resource.lon: 'lcp_' + nanoid(8)

                const containerResource = {
                    ri: containerRi,
                    rn: containerName,
                    pi: resource.pi,
                    li: ri
                }

                await this.lookupRepository.save({
                    ri: containerRi,
                    pi: targetResource.ri,
                    structured: targetResource.structured + '/' + containerName,
                    ty: resourceTypeEnum.container})

                await this.containerRepository.save(containerResource);
                const data = await this.locationPolicyRepository.save(resource);
                await this.lookupRepository.save({
                    ri: ri,
                    pi: targetResource.ri,
                    structured: targetResource.structured + '/' + pc["m2m:lcp"].rn,
                    ty: resourceTypeEnum.locationPolicy })

                return {
                    rsc: rsc.CREATED,
                    pc: {"m2m:lcp": data}
                }
            }
            case operationEnum.RETRIEVE:{
                const resource = await this.locationPolicyRepository.findOneBy({ri: targetResource.ri});
                if (!resource){
                    return rsc.NOT_FOUND;
                }
                return {
                    rsc: rsc.OK,
                    pc: {"m2m:lcp": resource}
                }
            }
            default: {
                return rsc.OPERATION_NOT_ALLOWED;
            }
        }
    }
    getResource(ri){
        return this.locationPolicyRepository.findOneBy({ri});
    }
}
