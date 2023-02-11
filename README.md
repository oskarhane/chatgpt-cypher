### WARNING

This will run Cypher generated by ChatGPT on your database.  
If ChatGPT decides to generate `MATCH (n) DETACH DELETE n` - all your data will be gone. For real.

### Query Neo4j with Natural Language

This experiment started with showing different use cases for
having a standardized format to describe a property graph schema.

There's a JSON schema that describes what a Graph Schema in JSON format
should look like at: https://github.com/neo4j/graph-schema-json-js-utils/blob/main/packages/json-schema/json-schema.json

Here we pass the schema with the natural language prompt to give ChatGPT context and knowledge on
how to query the graph in Cypher.

### Prerequisites

Neo4j 5.3 or higher: https://neo4j.com  
Experimental Neo4j Graph Schema inference plugin: https://github.com/neo4j/graph-schema-introspector/releases/tag/early-access  
OpenAI API Key: https://platform.openai.com/account/api-keys  
Nodejs >= 18: https://nodejs.org/en/

### Usage

1. Clone this repo
2. Open terminal and install deps: `npm install`
3. (optional): If you run this in dev mode, you can copy `.env.exmaple` -> `.env` and enter your OpenAI API Key. So you don't have to enter it in the UI all the time.
4. To run in dev mode (auto-reload if you make changes): `npm run dev` or in prod mode: `npm run build && npm start`.
