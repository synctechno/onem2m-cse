import dataSource from '../../database.js'
import {resourceTypeEnum, resultData, rscEnum as rsc} from "../../types/types.js";
import {operationEnum} from "../../types/primitives.js";
import {AccessControlPolicyRepository} from "./accessControlPolicy.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {AccessControlPolicy} from "./accessControlPolicy.entity";
import {nanoid} from "nanoid";

export class AccessControlPolicyManager {
    private acpRepository;
    private lookupRepository;

    constructor() {
        this.acpRepository = new AccessControlPolicyRepository(dataSource);
        this.lookupRepository = new LookupRepository(dataSource);
    }

    async handleRequest(op: operationEnum, pc?, targetResource?): Promise<resultData>{
        switch (op){
            case operationEnum.CREATE: {
                const resource: any = pc["m2m:acp"];
                resource.pi = targetResource.ri;

                const ri = nanoid(8);
                resource.ri = ri;

                const data = await this.acpRepository.save(resource);
                await this.lookupRepository.save({
                    ri: ri,
                    pi: targetResource.ri,
                    structured: targetResource.structured + '/' + pc["m2m:acp"].rn,
                    ty: resourceTypeEnum.accessControlPolicy })

                return {
                    rsc: rsc.CREATED,
                    pc: {"m2m:acp": data}
                }
            }
            case operationEnum.RETRIEVE: {
                const resource = await this.acpRepository.findOneBy({ri: targetResource.ri});
                if (!resource){
                    return rsc.NOT_FOUND;
                }
                return {
                    rsc: rsc.OK,
                    pc: {"m2m:acp": resource}
                }
            }
            default: {
                return rsc.OPERATION_NOT_ALLOWED;
            }
        }
    }

    async checkPrivileges(originator, acpi, isAcpResource = false) {
        let operationsBinary = "";

        const privAttr = isAcpResource ? "pvs" : "pv"

        const acp:AccessControlPolicy = await this.acpRepository.findOneBy({ri: acpi});
        for (let i=0; i<acp[privAttr].length; i++){
            if (acp[privAttr][i].acor === originator){
                operationsBinary = dec2bin(acp.pv[i].acop);
                return new Map([
                    [operationEnum.CREATE, operationsBinary.charAt(5) === "1"],
                    [operationEnum.RETRIEVE, operationsBinary.charAt(4) === "1"],
                    [operationEnum.UPDATE, operationsBinary.charAt(3) === "1"],
                    [operationEnum.DELETE, operationsBinary.charAt(2) === "1"],
                    [operationEnum.NOTIFY, operationsBinary.charAt(1) === "1"],
                    [operationEnum.DISCOVERY, operationsBinary.charAt(0) === "1"],
                ])
            }
        }
        //if the originator is not found, then no permission for all operations
        return new Map([
            [operationEnum.CREATE, false],
            [operationEnum.RETRIEVE, false],
            [operationEnum.UPDATE, false],
            [operationEnum.DELETE, false],
            [operationEnum.NOTIFY, false],
            [operationEnum.DISCOVERY, false],
        ])
    }

    getResource(ri){
        return this.acpRepository.findBy({ri});
    }
}

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}
