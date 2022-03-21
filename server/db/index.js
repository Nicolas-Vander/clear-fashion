require('dotenv').config();
const {MongoClient} = require('mongodb');
const fs = require('fs');
const MONGODB_DB_NAME = 'WAA';
const MONGODB_COLLECTION = 'FinalProducts';
const MONGODB_URI = 'mongodb+srv://test:test@waa.q7jsu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

let client = null;
let database = null;

/**
 * Get db connection
 * @type {MongoClient}
 */
const getDB = module.exports.getDB = async () => {
  try {
    if (database) {
      console.log('💽  Already Connected');
      return database;
    }
    client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    database = client.db(MONGODB_DB_NAME);
    console.log('💽  Connected');
    return database;
  } 
  catch (error) {
    console.error('🚨 MongoClient.connect...', error);
    return null;
    
  }
};

/**
 * Insert list of products
 * @param  {Array}  products
 * @return {Object}
 */
module.exports.insert = async products => {
  try { 
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.insertMany(products, {'ordered': false});
    return result;
  } catch (error) {
    console.error('🚨 collection.insertMany...', error);
    fs.writeFileSync('products.json', JSON.stringify(products));
    return {
      'insertedCount': error.result.nInserted
    };
  }
};

/**
 * Find products based on query
 * @param  {Array}  query
 * @return {Array}
 */
module.exports.find = async query => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    const result = await collection.find(query).toArray();

    return result;
  } catch (error) {
    console.error('🚨 collection.find...', error);
    return null;
  }
};

/**
 * Function to find all products of the collection
 */
 module.exports.findAllProducts = async (printResults = false) => {
  const db = await getDB();
  const result = await db.collection(MONGODB_COLLECTION).find().toArray()
  if(printResults){
      console.log(' 🧐 Find: All products', );
      console.log(` 📄 ${result.length} documents found:`);
      await result.forEach(doc => console.log(doc));
  }
  return result
}

/**
 * Empty collection
 */
 module.exports.deleteDatabase = async () => {
  try {
    const db = await getDB();
    const collection = db.collection(MONGODB_COLLECTION);
    collection.deleteMany();
    console.log("Everything has been deleted");
  } 
  catch (error) {
    console.error('🚨 collection.find...', error);
  }
};

/**
 * Close the connection
 */
module.exports.close = async () => {
  try {
    await client.close();
  } catch (error) {
    console.error('🚨 MongoClient.close...', error);
  }
};