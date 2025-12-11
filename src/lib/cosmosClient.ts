import { CosmosClient, Database, Container } from '@azure/cosmos';

const connectionString = process.env.COSMOS_CONNECTION_STRING;
const databaseName = process.env.COSMOS_DATABASE_NAME || 'caroliv-db';

let client: CosmosClient;
let database: Database;

export function getCosmosClient(): CosmosClient {
    if (!client) {
        if (!connectionString) {
            console.error('CRITICAL: COSMOS_CONNECTION_STRING environment variable is not set!');
            throw new Error('Cosmos DB connection string is required. Please set COSMOS_CONNECTION_STRING environment variable.');
        }
        client = new CosmosClient(connectionString);
    }
    return client;
}

export function getDatabase(): Database {
    if (!database) {
        const client = getCosmosClient();
        database = client.database(databaseName);
    }
    return database;
}

export function getContainer(containerName: string): Container {
    const db = getDatabase();
    return db.container(containerName);
}

// Container names
export const CONTAINERS = {
    USERS: 'users',
    EXERCISES: 'exercises',
    FOODS: 'foods',
    LOGS: 'logs',
} as const;
