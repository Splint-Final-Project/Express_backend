import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { CohereEmbeddings } from "@langchain/cohere";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_DB_URI);
const namespace = "test.langchainPickles";
const [dbName, collectionName] = namespace.split(".");
const collection = client.db(dbName).collection(collectionName);

export const vectorDataSaver = async (data) => {
  try {
    const text = `
        title: ${data.title || ""}
        capacity: ${data.capacity || ""}
        cost: ${data.cost || ""}
        deadLine: ${data.deadLine || ""}
        participants: ${JSON.stringify(data.participants) || ""}
        isCancelled: ${data.isCancelled || ""}
        where: ${data.where || ""}
        when: ${JSON.stringify(data.when) || ""}
        category: ${data.category || ""}
        explanation: ${data.explanation || ""}
        latitude: ${data.latitude || ""}
        longitude: ${data.longitude || ""}
        viewCount: ${data.viewCount || ""}
        createdAt: ${data.createdAt || ""}
        updatedAt: ${data.updatedAt || ""}
    `;
    const textDocs = text.replace(/\s+/g, ' ').trim();

  const metadata = { pickleId: data._id.toString() };

  const vectorstore = await MongoDBAtlasVectorSearch.fromTexts(
    [textDocs],
    [metadata],
    new CohereEmbeddings(),
    {
      collection,
      indexName: "vector-index", // The name of the Atlas search index. Defaults to "default"
      textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
      embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
    }
  );
  console.log('Vectorstore operation completed');
  } catch (e) {
    console.error('Error in dataSaver:', e);
    return e;
  }
}