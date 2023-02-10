import type { QueryResult } from 'neo4j-driver';

interface ResponseType {
	id: number;
	cmd: string;
	inputPrompt: string;
}
export type Statuses = {
	[key in 'success' | 'error']: key;
};
interface ResponseSuccess extends ResponseType {
	result: QueryResult;
	status: Statuses['success'];
}
interface ResponseError extends ResponseType {
	data: string;
	status: Statuses['error'];
}
export type Response = ResponseSuccess | ResponseError;
