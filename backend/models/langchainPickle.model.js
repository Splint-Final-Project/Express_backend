import mongoose from "mongoose";

const namespace = "test.langchainPickles";
const [dbName, collectionName] = namespace.split(".");

const LangchainPickleSchema = new mongoose.Schema({}, { collection: collectionName });

const LangchainPickle = mongoose.model('LangchainPickle', LangchainPickleSchema);

export default LangchainPickle;