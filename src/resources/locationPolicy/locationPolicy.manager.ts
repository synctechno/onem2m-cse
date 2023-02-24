import {resourceTypeEnum, resultData, rscEnum as rsc} from "../../types/types.js";
import {nanoid} from "nanoid";
import {BaseManager} from "../baseResource/base.manager.js";
import {LocationPolicy} from "./locationPolicy.entity.js";
import {BaseRepository} from "../baseResource/base.repository.js";
import {Container} from "../container/container.entity.js";
import {Lookup} from "../lookup/lookup.entity.js";


export class LocationPolicyManager extends BaseManager<LocationPolicy>{
    private readonly containerRepository: BaseRepository<Container>;

    constructor() {
        super(LocationPolicy);
        this.containerRepository = new BaseRepository<Container>(Container);
    }

    protected async create(pc, targetResource: Lookup, originator: string): Promise<resultData> {
        const resource: any = pc[this.prefix];
        resource.pi = targetResource.ri;

        const ri = nanoid(8);
        resource.ri = ri;
        resource.lost = "normal"

        const containerRi = nanoid(8);
        resource.loi = containerRi;

        const containerName = resource.lon ? resource.lon: 'lcp_' + nanoid(8)

        const containerResource: Container = {
            ri: containerRi,
            rn: containerName,
            pi: resource.pi,
            li: ri,
            cni: 0,
            cbs: 0,
            ty: resourceTypeEnum.container
        }

        const lcpResource = await this.repository.create(resource, targetResource, originator);
        if (!lcpResource){
            return rsc.INTERNAL_SERVER_ERROR
        }
        const cntResource = await this.containerRepository.create(containerResource, targetResource, originator);
        if (!cntResource){
            return rsc.INTERNAL_SERVER_ERROR
        }

        return {
            rsc: rsc.CREATED,
            pc: {[this.prefix]: lcpResource}
        }
    }
}
