type PromptArgTypes = {
	schema: string;
	prompt: string;
	metadata: { [key: string]: string };
	token: string;
};

export async function runPrompt({
	schema,
	prompt,
	metadata,
	token
}: PromptArgTypes): Promise<[string, { [key: string]: string }]> {
	const response = await fetch('/translate', {
		method: 'POST',
		body: JSON.stringify({ schema, prompt, metadata, token })
	});
	if (!response.ok) {
		const theError = await response.json();
		throw new Error(theError.message);
	}
	const json = await response.json();
	return [json.cypher, json.metadata];
}
