// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';
import fetch from 'node-fetch';

const response = await fetch('https://github.com/');
const body = await response.text();

console.log(body);

// current products on the page
let currentProducts = [];
let currentPagination = {};

// all my needed var
let brand = '';
let allProducts = [];
let recent = false;
let recentSorted = [];
let sort = [];
// inititiqte selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrand = document.querySelector('#brand-select');
const selectRecent = document.querySelector('#recent-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12, brand = '') => {
  try {
    const response = await fetch(
      //`https://clear-fashion-api.vercel.app?page=${page}&size=${size}&brand=${brand}`
      `https://clear-fashion-bj1rzq6fi-nicolas-vander.vercel.app/products/${brand}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
};

async function getAllItems (listOfItems,products,count){
  const data = await fetchProducts(1, count)
  for (let i = 0; i < data.result.length; i++){
    const item = data.result[i]
    products.push(item);
    if (!listOfItems[item.brand]){
      listOfItems[item.brand] = true;
    }
  }
  return {listOfItems, products}
}

/* function getAllItems (listOfItems, count){
  return new Promise((resolve, reject) => {
    fetchProducts(1, count)
    .then((data) => {
      for (let i = 0; i < data.result.length; i++){
        const item = data.result[i]
        if (!listOfItems[item.brand]){
          listOfItems[item.brand] = true;
        }
      }
      resolve(listOfItems)
    })
  })
} */

function sort_by_price(allProducts) 
{
  sort = {... allProducts};
	sort.sort((value1,value2) => (value1.price > value2.price) ? 1 : -1);
	return sort;
}

function sortRecentProduct (allProducts, sort){
  let twoWeeksAgo = new Date(Date.now() - 1209600000000000); //12096e5 is two weeks in miliseconds
  for(let i = 0; i < allProducts.length; i++){
    let d = new Date(allProducts[i].released); 
    if(d.getTime() < twoWeeksAgo.getTime()){allProducts[i].newProducts = true}
    else {allProducts[i].newProducts = false}
    if(allProducts[i].newProducts == true){
      sort.push(allProducts[i]);
    }
  }
  return sort;
}

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 * @type {[type]}
 */
selectShow.addEventListener('change', event => {
  fetchProducts(1, parseInt(event.target.value), brand)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectPage.addEventListener('change', event => {
  var selectedPage = event.target.value;
  fetchProducts(selectedPage, currentPagination.pageSize, brand)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectBrand.addEventListener('change', event => {
  brand = event.target.value;
  fetchProducts(1, currentPagination.pageSize, brand)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

selectRecent.addEventListener('change', event => {
  recent = event.target.value;
  if (recent == true){
    recentSorted = sortRecentProduct(allProducts, []);
  }
});

document.addEventListener('DOMContentLoaded', () =>
  fetchProducts()
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination))
    .then(() => getAllItems({},[],currentPagination.count))
    .then(({listOfItems, products}) => {
      allProducts = products;
      const options = [];
      options.push(selectBrand.innerHTML)
      for(let key in listOfItems){
        options.push(`<option value="${key}">${key}</option>`)
      }
      selectBrand.innerHTML = options.join('');
    })
);
