import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { CohereEmbeddings } from "@langchain/cohere";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_DB_URI);
const namespace = "test.langchainPickles";
const [dbName, collectionName] = namespace.split(".");
const collection = client.db(dbName).collection(collectionName);

const vectorStore = new MongoDBAtlasVectorSearch(new CohereEmbeddings(), {
  collection,
  indexName: "vector-index", // The name of the Atlas search index. Defaults to "default"
  textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
  embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
});

const retriever = vectorStore.asRetriever({
  searchType: "mmr",
  searchKwargs: {
    fetchK: 20,
    lambda: 0.1,
    k: 10, // 리턴할 결과의 수를 지정
  },
});

export const vectorSearchEngine = async (message) => {
  return await retriever.invoke(message);
}
