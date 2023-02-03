import {RegularResource} from "../baseResource/base.entity.js";
import {
    resourceTypeEnum,  eventNotificationCriteria
} from "../../types/types.js"
import {resourceType} from "../../types/ts-types.js"
import {Entity, Column} from "typeorm";

@Entity("subscription")
export class Subscription extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.subscription
    })
    ty: resourceType;

    @Column({
        type: "json",
        nullable: true})
    enc: eventNotificationCriteria //eventNotificationCriteria

    @Column("simple-array")
    nu: string[] //notificationURI

    static getTy(){
        return resourceTypeEnum.subscription;
    }
}
