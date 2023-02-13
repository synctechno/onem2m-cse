import { DataSource } from "typeorm"
import {databaseConfig} from "./configs/database.config.js";
import {CseBase} from "./resources/cseBase/cseBase.entity.js";
import {AE} from "./resources/ae/ae.entity.js";
import {Lookup} from "./resources/lookup/lookup.entity.js";
import {AccessControlPolicy} from "./resources/accessControlPolicy/accessControlPolicy.entity.js";
import {FlexContainer} from "./resources/flexContainer/flexContainer.entity.js";
import {Subscription} from "./resources/subscription/subscription.entity.js";
import {Container} from "./resources/container/container.entity.js";
import {ContentInstance} from "./resources/contentInstance/contentInstance.entity.js";
import {LocationPolicy} from "./resources/locationPolicy/locationPolicy.entity.js";
import {Group} from "./resources/group/group.entity.js";
import {Node} from "./resources/node/node.entity.js";

const CseDataSource = new DataSource({
    type: "postgres",
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.database,
    entities: [
        Lookup,
        CseBase,
        AE,
        AccessControlPolicy,
        FlexContainer,
        Subscription,
        Container,
        ContentInstance,
        LocationPolicy,
        Group,
        Node
    ],
    synchronize: true
})

CseDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
        return CseDataSource;
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
        return CseDataSource;
    })

export default CseDataSource;
