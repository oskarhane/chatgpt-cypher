import { OPENAI_API_KEY } from '$env/static/private';
import { ChatGPTAPI } from 'chatgpt';
import type { RequestHandler } from './$types';

export const POST = (async (event) => {
	const { request } = event;
	const { prompt, schema } = await request.json();

	const fullPrompt = `With this JSON that describes a schema for a property graph database: 
    
    ${schema}
    
    And this plain text question: '${prompt}'
    
    Can you generate a Cypher query that will answer the question?`;

	const api = new ChatGPTAPI({
		apiKey: OPENAI_API_KEY
	});
	const res = await api.sendMessage(fullPrompt);
	console.log('res: ', res);
	return new Response(JSON.stringify({ cypher: res.text }));
}) satisfies RequestHandler;
