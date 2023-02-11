import type { QueryResult } from 'neo4j-driver';

interface ResponseType {
	id: number;
	cypher: string;
	prompt: string;
}
export type Statuses = {
	[key in 'success' | 'error' | 'text']: key;
};
export interface ResponseSuccess extends ResponseType {
	result: QueryResult;
	status: Statuses['success'];
}
export interface ResponseError extends ResponseType {
	data: string;
	status: Statuses['error'];
}
export interface ResponseText extends ResponseType {
	data: string;
	status: Statuses['text'];
}
export type Response = ResponseSuccess | ResponseError;
