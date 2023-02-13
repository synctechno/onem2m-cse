import {BaseManager} from "../baseResource/base.manager.js";
import {Group} from "./group.entity.js";
import {consistencyStrategy, resourceTypeEnum, resultData, rscEnum as rsc} from "../../types/types.js";
import {handleTo} from "../../utils.js";
import {cseConfig} from "../../configs/cse.config.js";
import {LookupRepository} from "../lookup/lookup.repository.js";
import dataSource from "../../database.js";
import {Lookup} from "../lookup/lookup.entity.js";
import {FlexContainer} from "../flexContainer/flexContainer.entity.js";
import {BaseRepository} from "../baseResource/base.repository.js";

enum memberStatus {
    OK,
    WRONG_ID,
    DOES_NOT_EXIST,
    TYPE_MISMATCH
}

export class GroupManager extends BaseManager<Group> {
    private lookupRepository: LookupRepository;
    private flexContainerRepository: BaseRepository<FlexContainer>;

    constructor() {
        super(Group);
        this.lookupRepository = new LookupRepository(dataSource);
        this.flexContainerRepository = new BaseRepository<FlexContainer>(FlexContainer);
    }

    protected async create(pc, targetResource, options?): Promise<resultData> {
        const resource: Group = pc[this.prefix];
        resource.pi = targetResource.ri;

        //remove duplicates
        resource.mid = [...new Set(resource.mid)];

        //check that number of member ids does not exceed maximum number of members
        if (resource.mid.length > resource.mnm) {
            return rsc.MAX_NUMBER_OF_MEMBER_EXCEEDED
        }
        //assign default value consistencyStrategy = ABANDON_MEMBER
        if (!resource.csy) {
            resource.csy = consistencyStrategy.ABANDON_MEMBER
        }

        const memberIdStatusArr = await this.validateMemberIds(resource.mid, resource.mt, resource.spty);

        //behave according to validation result
        for (let i = memberIdStatusArr.length - 1; i >= 0; i--) {
            switch (memberIdStatusArr[i].status) {
                case memberStatus.OK:
                    break;
                case memberStatus.WRONG_ID: {
                    return rsc.BAD_REQUEST //TODO clarify right rsc
                }
                case memberStatus.DOES_NOT_EXIST: {
                    return rsc.NOT_FOUND //TODO clarify right rsc
                }
                //if type mismatch, behave according to consistencyStrategy attribute
                case memberStatus.TYPE_MISMATCH: {
                    switch (resource.csy) {
                        case consistencyStrategy.ABANDON_MEMBER: {
                            memberIdStatusArr.splice(i, 1);
                            break;
                        }
                        case consistencyStrategy.ABANDON_GROUP: {
                            return rsc.GROUP_MEMBER_TYPE_INCONSISTENT
                        }
                        case consistencyStrategy.SET_MIXED: {
                            resource.mt = resourceTypeEnum.mixed;
                            break;
                        }
                    }
                }
            }
        }
        if (resource.mt !== resourceTypeEnum.mixed) {
            resource.mtv = true; //set memberTypeValidated = true after validating memberIds
        }
        resource.cnm = memberIdStatusArr.length; //number of members

        const data = await this.repository.create(resource, targetResource);
        if (data === false) {
            return rsc.INTERNAL_SERVER_ERROR;
        }
        return {
            rsc: rsc.CREATED,
            pc: {[this.prefix]: data}
        }
    }

    protected async update(pc, targetResource): Promise<resultData> {
        const resource: Group = pc[this.prefix];

        //remove duplicates
        if (resource.mid) resource.mid = [...new Set(resource.mid)];

        const oldResource = await this.getResource(targetResource.ri);
        if (!oldResource){
            return rsc.INTERNAL_SERVER_ERROR
        }
        //check that number of member ids does not exceed maximum number of members
        if (resource.mnm) oldResource.mnm = resource.mnm;
        if (resource.mid) oldResource.mid = resource.mid;
        if (oldResource.mid.length > oldResource.mnm){
            return rsc.MAX_NUMBER_OF_MEMBER_EXCEEDED
        }

        const memberIdStatusArr = await this.validateMemberIds(oldResource.mid, oldResource.mt, oldResource.spty);

        //behave according to validation result
        for (let i = memberIdStatusArr.length - 1; i >= 0; i--) {
            switch (memberIdStatusArr[i].status) {
                case memberStatus.OK:
                    break;
                case memberStatus.WRONG_ID: {
                    return rsc.BAD_REQUEST //TODO clarify right rsc
                }
                case memberStatus.DOES_NOT_EXIST: {
                    return rsc.NOT_FOUND //TODO clarify right rsc
                }
                //if type mismatch, behave according to consistencyStrategy attribute
                case memberStatus.TYPE_MISMATCH: {
                    switch (resource.csy) {
                        case consistencyStrategy.ABANDON_MEMBER: {
                            memberIdStatusArr.splice(i, 1);
                            break;
                        }
                        case consistencyStrategy.ABANDON_GROUP: {
                            return rsc.GROUP_MEMBER_TYPE_INCONSISTENT
                        }
                        case consistencyStrategy.SET_MIXED: {
                            resource.mt = resourceTypeEnum.mixed;
                            break;
                        }
                    }
                }
            }
        }
        if (resource.mt !== resourceTypeEnum.mixed) {
            resource.mtv = true; //set memberTypeValidated = true after validating memberIds
        }
        resource.cnm = memberIdStatusArr.length; //number of members

        const data = await this.repository.update(resource, targetResource.ri);
        if (data === false) {
            return rsc.INTERNAL_SERVER_ERROR;
        }
        return {
            rsc: rsc.UPDATED,
            pc: {[this.prefix]: data}
        }
    }

    async validateMemberIds(mid: string[], mt: resourceTypeEnum, spty: string): Promise<{ id: string, status: memberStatus }[]> {
        let memberIdStatusArr: { id: string, status: memberStatus, lookupData?: Lookup }[] = [];
        for (const memberId of mid) {
            const parsedMemberId = handleTo(memberId, cseConfig.cseName);
            //if wrongly formatted memberId, return error
            if (parsedMemberId === null) {
                memberIdStatusArr.push({
                    id: memberId,
                    status: memberStatus.WRONG_ID
                })
                break;
            } else if (parsedMemberId.spId) {
                if (parsedMemberId.spId !== cseConfig.spId) {
                    //TODO handle the case when M2M-SP-ID is different from the configured one
                    memberIdStatusArr.push({
                        id: memberId,
                        status: memberStatus.WRONG_ID
                    })
                    break;
                }
            } else if (parsedMemberId.cseId) {
                if (parsedMemberId.cseId !== cseConfig.cseId) {
                    //TODO handle the case when Relative CSE-ID is different from the configured one
                    memberIdStatusArr.push({
                        id: memberId,
                        status: memberStatus.WRONG_ID
                    })
                    break;
                }
            }

            const lookupData = await this.lookupRepository.findOneBy(
                {[parsedMemberId.structured ? 'structured' : 'ri']: parsedMemberId.id}
            )
            if (lookupData === null) {
                memberIdStatusArr.push({
                    id: memberId,
                    status: memberStatus.DOES_NOT_EXIST
                })
            } else {
                if (mt !== resourceTypeEnum.mixed) {
                    if ((lookupData.ty === mt)) {
                        if (mt !== resourceTypeEnum.flexContainer) {
                            memberIdStatusArr.push({
                                id: memberId,
                                status: memberStatus.OK,
                                lookupData: lookupData
                            })
                        } else {
                            //if resource is flexContainer, check specialization of flexContainer match specializationType
                            const fcnt = await this.flexContainerRepository.findOneBy(lookupData.ri);
                            if (!fcnt || fcnt.cnd !== spty) {
                                memberIdStatusArr.push({
                                    id: memberId,
                                    status: memberStatus.TYPE_MISMATCH
                                })
                            } else {
                                memberIdStatusArr.push({
                                    id: memberId,
                                    status: memberStatus.OK
                                })
                            }
                        }
                    } else {
                        memberIdStatusArr.push({
                            id: memberId,
                            status: memberStatus.TYPE_MISMATCH
                        })
                    }
                } else {
                    memberIdStatusArr.push({
                        id: memberId,
                        status: memberStatus.OK,
                        lookupData: lookupData
                    })
                }

            }
        }
        return memberIdStatusArr;
    }
}
