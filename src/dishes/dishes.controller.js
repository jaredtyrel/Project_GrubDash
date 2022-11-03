const path = require("path");

const dishes = require(path.resolve("src/data/dishes-data"));

const nextId = require("../utils/nextId");

function list(req, res) {
  res.json({ data: dishes });
}

function priceExists(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (!price) {
    next({
      status: 400,
      message: "Dish must include a price",
    });
  } else if (price <= 0 || typeof price != "number") {
    next({
      status: 400,
      message: "Dish must hav a price that is an integer greater than 0",
    });
  }
  return next();
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({ status: 400, message: `Dish must include a ${propertyName}` });
  };
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newId = nextId();
  const newdish = {
    id: newId,
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newdish);
  res.status(201).json({ data: newdish });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const dishPaste = dishes.find((dish) => dish.id === dishId);
  if (dishPaste) {
    res.locals.dish = dishPaste;
    console.log(res.locals);
    return next();
  }
  next({
    status: 404,
    message: `dish id not found: ${dishId}`,
  });
}

function read(req, res) {
  const { dishId } = req.params;
  const dishPaste = dishes.find((dish) => dish.id === dishId);
  res.json({ data: dishPaste });
}

function update(req, res, next) {
  const { dishId } = req.params;
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  if (!id || dishId === id) {
    const updatedDish = {
      id: dishId,
      name,
      description,
      price,
      image_url,
    };
    res.json({ data: updatedDish });
  }

  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

module.exports = {
  list,
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"),
    priceExists,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("image_url"),
    priceExists,
    update,
  ],
};
