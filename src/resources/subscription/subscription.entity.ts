import {RegularResource} from "../baseResource/base.entity.js";
import {eventNotificationCriteria, resourceTypeEnum} from "../../types/types.js"
import {Column, Entity} from "typeorm";

@Entity("subscription")
export class Subscription extends RegularResource {
    @Column({
        type: "enum",
        enum: resourceTypeEnum,
        default: resourceTypeEnum.subscription
    })
    ty = resourceTypeEnum.subscription;

    @Column({
        type: "json",
        nullable: true})
    enc: eventNotificationCriteria //eventNotificationCriteria

    @Column("simple-array")
    nu: string[] //notificationURI
}
