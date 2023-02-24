import {resultData, rscEnum, rscEnum as rsc} from "../../types/types.js";
import {nanoid} from "nanoid";
import {BaseManager} from "../baseResource/base.manager.js";
import {AE} from "./ae.entity.js";
import {Lookup} from "../lookup/lookup.entity.js";

export class AeManager extends BaseManager<AE>{
    constructor() {
        super(AE);
    }

    public async create(pc, targetResource: Lookup, originator: string): Promise<resultData> {
        if (originator.charAt(0) !== 'C' && originator.charAt(0) !== 'S'){ //TODO clarify the usage of 'C' and 'S'
            return rscEnum.BAD_REQUEST;
        }

        if (!['N', 'R'].includes(pc[this.prefix].api.charAt(0))){ //TODO clarify the usage of 'N', 'R', and 'r'?
            return rscEnum.BAD_REQUEST;
        }
        let aei = "";
        if (originator === 'S'){
            aei = 'S' + nanoid(8)
        } else if (originator.charAt(0) === 'C'){
            aei = originator;
        }

        const resource: any = pc[this.prefix];
        resource.pi = targetResource.ri;
        resource.aei = aei;

        const data = await this.repository.create(resource, targetResource, originator);
        if (data === false) {
            return rsc.INTERNAL_SERVER_ERROR;
        }
        return {
            rsc: rsc.CREATED,
            pc: {[this.prefix]: data}
        }
    }
}
