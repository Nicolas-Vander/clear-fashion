/* eslint-disable no-console, no-process-exit */
const { load } = require('cheerio');
const dedicatedbrand = require('./sources/dedicatedbrand');

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

  const result = await sandbox('https://www.dedicatedbrand.com/en/loadfilter', 'dedicated');
  products.push(...result)

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

  return products
}

async function display() {
  const result = await loadResult()
  console.log(result)
}

display()