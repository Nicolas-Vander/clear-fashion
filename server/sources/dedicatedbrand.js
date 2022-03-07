const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = (data, siteName) => {
  const $ = cheerio.load(data);

  if (siteName === 'dedicated') {

    return $('.productList-container .productList')
    .map((i, element) => {
      const name = $(element)
        .find('.productList-title')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const price = parseInt(
        $(element)
          .find('.productList-price')
          .text()
      );

      return {name, price};
    })
    .get();
  } else if (siteName === 'montlimart') {

    return $('.item').map(function(i, element) {
      const name = $(element)
        .find('.product-name')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const price = $(element)
        .find('.price')
        .text()

      return {name, price: parseInt(price.slice(0, -2)), siteName};
    })
    .get()
    .filter(function (val) {
      if (val.name) return val
    })
  }
};

function getAllProductsDetails(data, siteName) {
  return data.map(function (product) {
    if (product && product.id) {
      return {
        name: product.name,
        price: product.price.priceAsNumber,
        brandName: siteName
      }
    }
  }).filter(function (val) {
    if (val) return val
  })
}

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async (url, siteName) => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      if (siteName === 'dedicated') {
        const body = await response.json();

        return getAllProductsDetails(body.products, siteName)
      } else if (siteName === 'montlimart') {
        const body = await response.text();

        return parse(body, siteName);
      }
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
