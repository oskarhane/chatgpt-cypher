import neo4j, { type Driver, type QueryResult } from 'neo4j-driver';

export const schemaQuery = `
CALL db.labels() YIELD label
WITH collect(label) AS labels
RETURN labels AS result
UNION ALL
CALL db.relationshipTypes() YIELD relationshipType
WITH collect(relationshipType) AS relationshipTypes
RETURN relationshipTypes as result
`;

export function runQuery(driver: Driver, q: string): Promise<QueryResult> {
	// eslint-disable-next-line
	return new Promise(async (resolve, reject) => {
		if (!driver) {
			reject(new Error('Driver not connected'));
			return;
		}
		const session = driver.session();
		try {
			const res = await session.run(q);
			resolve(res);
		} catch (e) {
			reject(e);
		}
		session.close();
	});
}

export async function connect({
	connectURL,
	username,
	password
}: {
	connectURL: string;
	username: string;
	password: string;
}): Promise<Driver> {
	const newDriver = neo4j.driver(connectURL, neo4j.auth.basic(username, password));
	await newDriver.verifyConnectivity();
	return newDriver;
}
