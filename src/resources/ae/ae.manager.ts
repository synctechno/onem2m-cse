import {resultData, rscEnum, rscEnum as rsc} from "../../types/types.js";
import {nanoid} from "nanoid";
import {BaseManager} from "../baseResource/base.manager.js";
import {AE} from "./ae.entity.js";

export class AeManager extends BaseManager<AE>{
    constructor() {
        super(AE);
    }

    public async create(pc, targetResource, options?): Promise<resultData> {
        if (options?.fr.charAt(0) !== 'C' && options?.fr.charAt(0) !== 'S'){ //TODO clarify the usage of 'C' and 'S'
            return rscEnum.BAD_REQUEST;
        }

        if (!['N', 'R'].includes(pc[this.prefix].aei.charAt(0))){ //TODO clarify the usage of 'N', 'R', and 'r'?
            return rscEnum.BAD_REQUEST;
        }
        let resourceId = "";
        if (options?.fr === 'S'){
            resourceId = 'S' + nanoid(8)
        } else if (options?.fr.charAt(0) === 'C'){
            resourceId = options?.fr;
        }

        const resource: any = pc[this.prefix];
        resource.pi = targetResource.ri;
        resource.ri = resourceId;

        const data = await this.repository.create(resource, targetResource);
        if (data === false) {
            return rsc.INTERNAL_SERVER_ERROR;
        }
        return {
            rsc: rsc.CREATED,
            pc: {[this.prefix]: data}
        }
    }
}
