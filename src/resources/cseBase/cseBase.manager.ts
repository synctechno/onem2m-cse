import dataSource from '../../database.js'
import {CseBase} from "./cseBase.entity.js";
import {resourceTypeEnum, supportedReleaseVersions} from "../../types/types.js";
import {Repository} from "typeorm";
import {requestPrimitive, responsePrimitive} from "../../types/primitives.js";
import {CseBaseRepository} from "./cseBase.repository.js";
import {LookupRepository} from "../lookup/lookup.repository.js";

const SRV: supportedReleaseVersions = ["3"]
const POA = ["http://127.0.0.1:3000"]
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
            path: "/" + rn,
            ty: resourceTypeEnum.CSEBase
        })
    }

    async primitiveHandler(primitive: requestPrimitive): Promise<responsePrimitive>{
        if (primitive["m2m:rqp"].op === 2){
            const data = await this.cseBaseRepository.findOneById(primitive["m2m:rqp"].to);
            return {
                "m2m:rsp":{
                    rsc: 2000,
                    rqi: primitive["m2m:rqp"].ri,
                    rvi: primitive["m2m:rqp"].rvi,
                    ot: new Date(),
                    pc: data
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
}
