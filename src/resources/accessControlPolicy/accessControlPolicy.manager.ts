import {operationEnum} from "../../types/primitives.js";
import {AccessControlPolicy} from "./accessControlPolicy.entity.js";
import {BaseManager} from "../baseResource/base.manager.js";
import {resultData} from "../../types/types.js";
import {defaulAeConfig} from "../../configs/cse.config.js";

export class AccessControlPolicyManager extends BaseManager<AccessControlPolicy>{
    constructor() {
        super(AccessControlPolicy);
    }

    public async create(pc, targetResource, originator): Promise<resultData> {
        return super.create(pc, targetResource, originator);
    }

    async checkPrivileges(originator, acpi, isAcpResource = false) {
        //if origin = Admin AE, grant full access
        if (originator === defaulAeConfig.aei){
            return new Map([
                [operationEnum.CREATE, true],
                [operationEnum.RETRIEVE, true],
                [operationEnum.UPDATE, true],
                [operationEnum.DELETE, true],
                [operationEnum.NOTIFY, true],
                [operationEnum.DISCOVERY, true],
            ])
        }

        let operationsBinary = "";

        const privAttr = isAcpResource ? "pvs" : "pv"

        const acp = await this.repository.findOneBy(acpi);
        //if the originator is not found, then no permission for all operations
        if (!acp){
            return new Map([
                [operationEnum.CREATE, false],
                [operationEnum.RETRIEVE, false],
                [operationEnum.UPDATE, false],
                [operationEnum.DELETE, false],
                [operationEnum.NOTIFY, false],
                [operationEnum.DISCOVERY, false],
            ])
        }
        for (let i=0; i<acp[privAttr].acr.length; i++){
            for (let acor of acp[privAttr].acr[i].acor){
                if (acor === originator){
                    operationsBinary = dec2bin(acp[privAttr].acr[i].acop);
                    const opLength = operationsBinary.length;
                    return new Map([
                        [operationEnum.CREATE, operationsBinary.charAt(opLength - 1) === "1"],
                        [operationEnum.RETRIEVE, operationsBinary.charAt(opLength - 2) === "1"],
                        [operationEnum.UPDATE, operationsBinary.charAt(opLength - 3) === "1"],
                        [operationEnum.DELETE, operationsBinary.charAt(opLength - 4) === "1"],
                        [operationEnum.NOTIFY, operationsBinary.charAt(opLength - 5) === "1"],
                        [operationEnum.DISCOVERY, operationsBinary.charAt(opLength - 6) === "1"],
                    ])
                }
            }
        }
        //should not reach here
        return new Map([
            [operationEnum.CREATE, false],
            [operationEnum.RETRIEVE, false],
            [operationEnum.UPDATE, false],
            [operationEnum.DELETE, false],
            [operationEnum.NOTIFY, false],
            [operationEnum.DISCOVERY, false],
        ])
    }
}


function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}
