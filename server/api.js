const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { ObjectId } = require('mongodb');
const db = require('./db');

const PORT = 8092;
const app = express();
module.exports = app;
var products = "";

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

async function connection(){
  await db.getDB();
}

app.options('*', cors());
console.log(`📡 Running on port ${PORT}`);

app.get('/', (request, response) => {
  response.send({'ack': true});
});

//Get all products
app.get('/products', async(request, response) => {
  products = await db.findAllProducts(true)
  console.log(products.length)
  response.send({"products" : products});
})

// Get products from a specific brand 
app.get('/products/dedicated', async(request, response) => {
  products = await db.find({'brandName': 'dedicated'}, false)
  console.log(products.length)
  response.send({"products" : products});
})

app.get('/products/montlimart', async(request, response) => {
  products = await db.find({'brandName': 'montlimart'}, false)
  console.log(products.length)
  response.send({"products" : products});
})

// Get products from a specific id
app.get('/products/:id', async (request, response) => { 
  const id = request.params.id
  console.log(id)
  items = db.find()
  .then((item) => {
    products = item.filter(i => i._id == id)
    response.send(products)
  });
});
async function main(){
  await connection();
  app.listen(PORT);
  //await request();
  //await db.close();
}

main();


