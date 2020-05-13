// @ts-nocheck
const fetch = require("cross-fetch");
const ItemParser = require('./ItemParser'); 

const currency = {
  ARS: '$',
  USD: 'US$'
}
async function getItems(req, res)  {
  try {
    const { search } = req.query;
    const url = `https://api.mercadolibre.com/sites/MLA/search?limit=1&q=${search}`;
    const { results, filters } = await fetch(url).then(res => res.json());
    
    const items = ItemParser.parseItems(results);
    const categories = ItemParser.getCategoriesFromFilters(filters);

    res.send({
      filters,
      author: { name: "Mariano Andres", lastName: "Venesio" },
      items,
      categories,
    });
  } catch (e) {
    console.error("Error while fetching items: ", e);
    res.sendStatus(500);
  }
};

async function getItemDetails(req, res)  {
  try {
    const { id } = req.query;
    const [details, description] = await Promise.all([
      fetch(`https://api.mercadolibre.com/items/${id}`).then(res => res.json()),
      fetch(`https://api.mercadolibre.com/items/${id}/description`).then(res => res.json())
    ]);
    const { plain_text } = description;
    const { category_id } = details;
    const categoryUrl = `https://api.mercadolibre.com/categories/${category_id}`;

    const categories = await fetch(categoryUrl).then(res => res.json()).then(data => data.path_from_root.map(category => category.name));
    const item = ItemParser.createItemObject(details, plain_text);


    res.send({
      details,
      plain_text,
      author: { name: "Mariano Andres", lastName: "Venesio" },
      item,
      categories
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

module.exports = {
    getItems,
    getItemDetails

}