import { error } from '@sveltejs/kit';
import { ChatGPTAPI, ChatGPTError } from 'chatgpt';
import type { RequestHandler } from './$types';

export const POST = (async (event) => {
	const { request } = event;
	const { prompt, schema, token, metadata = {} } = await request.json();

	const fullPrompt = `With this JSON that describes a schema for a property graph database: 
    
    ${schema}
    
    And this plain text question: '${prompt}'
    
    Can you generate a Cypher query that will answer the question?`;

	try {
		const api = new ChatGPTAPI({
			apiKey: token,
			...metadata
		});
		const res = await api.sendMessage(fullPrompt);
		return new Response(
			JSON.stringify({
				cypher: res.text,
				metadata: {
					conversationId: metadata?.conversationId || res.conversationId,
					parentMessageId: res.id
				}
			})
		);
	} catch (e: unknown) {
		if (e instanceof ChatGPTError) {
			throw error(e.statusCode || 500, { message: e.message });
		}
		throw error(500, { message: (e as Error).message });
	}
}) satisfies RequestHandler;
