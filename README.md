# oneM2M CSE

## Installation

Requirements:
- Node.js
- Postgres database

The project uses Typescript and ts-node as an execution engine. 

After cloning the repository install the dependencies:

```
npm install
```

Create a database in Postgres and configure the connection information in ./src/configs/database.config.ts
```
export const databaseConfig = {
    host: 'localhost',
    port: 5432,
    username: 'cseuser',
    password: 'cseuser',
    database: 'onem2m',
};

```
Run using
```
npm start
```
