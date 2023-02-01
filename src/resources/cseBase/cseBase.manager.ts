import dataSource from '../../database.js'
import {resourceTypeEnum, resultData, rscEnum as rsc, supportedReleaseVersions} from "../../types/types.js";
import {operationEnum} from "../../types/primitives.js";
import {CseBaseRepository} from "./cseBase.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";

const SRV: supportedReleaseVersions = ["3"];
const POA = ["http://127.0.0.1:3000"];
const CSE_RESOURCE_ID = "KLFHnzxa";

export class CseBaseManager{
    readonly ri = CSE_RESOURCE_ID;
    readonly rn: string;
    readonly csi: string;
    readonly pi = "";
    readonly srv = SRV;
    readonly poa = POA;
    private cseBaseRepository;
    private lookupRepository;

    constructor(rn: string = "", csi: string = "") {
        this.rn = rn;
        this.csi = csi;
        this.cseBaseRepository = new CseBaseRepository(dataSource);
        this.lookupRepository = new LookupRepository(dataSource);


        //wait 0.5s to establish database connection
        setTimeout(() => {
            this.init(this.ri, this.rn, this.csi, this.pi, this.srv, this.poa)
        }, 500);
    }

    init = async (ri:string, rn: string, csi: string, pi: string, srv: supportedReleaseVersions, poa: string[]) => {
        await this.cseBaseRepository.save({
                ri,
                rn,
                csi,
                pi,
                srv,
                poa,
            }
        );
        await this.lookupRepository.save({
            ri,
            pi: "",
            structured: rn,
            ty: resourceTypeEnum.CSEBase
        })
    }

    async handleRequest(op: operationEnum, targetResource): Promise<resultData>{
        switch (op) {
            case operationEnum.RETRIEVE:{
                const resource = await this.cseBaseRepository.findOneBy({ri: targetResource.ri});
                if (!resource){
                    return rsc.NOT_FOUND;
                }
                return {
                    rsc: rsc.OK,
                    pc: {"m2m:cb": resource}
                }
            }
            default:{
                return rsc.OPERATION_NOT_ALLOWED;
            }
        }
    }

    getResource(ri){
        return this.cseBaseRepository.findOneBy({ri});
    }
}
