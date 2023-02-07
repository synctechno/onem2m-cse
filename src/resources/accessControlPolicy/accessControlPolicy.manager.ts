import {operationEnum} from "../../types/primitives.js";
import {AccessControlPolicy} from "./accessControlPolicy.entity.js";
import {BaseManager} from "../baseResource/base.manager.js";

export class AccessControlPolicyManager extends BaseManager<AccessControlPolicy>{
    constructor() {
        super(AccessControlPolicy);
    }

    async checkPrivileges(originator, acpi, isAcpResource = false) {
        let operationsBinary = "";

        const privAttr = isAcpResource ? "pvs" : "pv"

        const acp = await this.repository.findOneBy(acpi);
        if (acp === null || acp === false){
            return new Map([
                [operationEnum.CREATE, false],
                [operationEnum.RETRIEVE, false],
                [operationEnum.UPDATE, false],
                [operationEnum.DELETE, false],
                [operationEnum.NOTIFY, false],
                [operationEnum.DISCOVERY, false],
            ])
        }
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
}


function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}
