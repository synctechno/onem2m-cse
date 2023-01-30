import dataSource from '../../database.js'
import {resourceTypeEnum} from "../../types/types.js";
import {operationEnum, requestPrimitive, responsePrimitive} from "../../types/primitives.js";
import {AccessControlPolicyRepository} from "./accessControlPolicy.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import {AccessControlPolicy} from "./accessControlPolicy.entity";
import {nanoid} from "nanoid";

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

export class AccessControlPolicyManager {
    private acpRepository;
    private lookupRepository;

    constructor() {
        this.acpRepository = new AccessControlPolicyRepository(dataSource);
        this.lookupRepository = new LookupRepository(dataSource);
    }

    async primitiveHandler(primitive: requestPrimitive, targetResource): Promise<responsePrimitive>{
        if (primitive["m2m:rqp"].op === operationEnum.CREATE){
            const resource: any = primitive["m2m:rqp"]["pc"]["m2m:acp"];
            resource.pi = targetResource.ri;

            const ri = nanoid(8);
            resource.ri = ri;

            const data = await this.acpRepository.save(resource);
            await this.lookupRepository.save({
                ri: ri,
                pi: targetResource.ri,
                structured: targetResource.structured + '/' + primitive["m2m:rqp"].pc["m2m:acp"].rn,
                ty: resourceTypeEnum.accessControlPolicy })

            return {
                "m2m:rsp":{
                    rsc: 2001,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: primitive["m2m:rqp"].ty,
                    pc: {"m2m:acp": data}
                }
            }
        }
        else if (primitive["m2m:rqp"].op === operationEnum.RETRIEVE){
            const resource = await this.acpRepository.findOneBy({ri: targetResource.ri});
            return {
                "m2m:rsp":{
                    rsc: 2000,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    ty: targetResource.ty,
                    pc: {"m2m:acp": resource}
                }
            }
        } else {
            return {
                "m2m:rsp":{
                    rsc: 5000,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    pc: undefined
                }
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
