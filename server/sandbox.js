/* eslint-disable no-console, no-process-exit */
const { load } = require('cheerio');
const dedicatedbrand = require('./sources/dedicatedbrand');
const db = require('./db/index.js');

async function sandbox (eshop = 'https://www.dedicatedbrand.com/en/loadfilter', siteName) {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop} source`);

    const products = await dedicatedbrand.scrape(eshop, siteName);
    return products
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

async function loadResult() {
  const products = []
  let i = 1
  let loopShouldBeOver = false
  let previousResult
  
  while (!loopShouldBeOver) {
    const result = await sandbox(`https://www.montlimart.com/toute-la-collection.html?p=${i}`, 'montlimart');
    if (JSON.stringify(previousResult) === JSON.stringify(result)) {
      loopShouldBeOver = true
      break
    }
    previousResult = result
    products.push(...result)
    i++;
  }
  const result = await sandbox('https://www.dedicatedbrand.com/en/loadfilter', 'dedicated');
  products.push(...result)



  return products
}

async function lessThan(price){
  return {price: {"$lte" : parseInt(price,10)}}
}

async function sort_by_price(allProducts) 
{
  sort = {... allProducts};
	sort.sort((value1,value2) => (value1.price > value2.price) ? 1 : -1);
	return sort;
}

async function display() {
  const result = await loadResult()
  console.log(result)
}

async function saveFile() {
  const result = await loadResult();
  var jsonData = JSON.stringify(result);
  var fs = require('fs');
  fs.writeFile("ProductScrapped.json", jsonData, function(err) {
      if (err) {
          console.log(err);
      }
  });
  //await db.insert(result);
  console.log(result);
  //const definedPrice = await lessThan(30);
  //const orderedByPrice = await sort_by_price(result);
  //console.log(definedPrice);
  //await db.deleteDatabase();
  await process.exit(1);
}
saveFile()