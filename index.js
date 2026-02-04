const content = document.querySelector(".main__content");
const template = document.querySelector(".main__template");
const headerCategories = document.querySelector(".header__categories");
const title = document.querySelector(".main__title");

const openModalButton = document.querySelector(".button-modal");
const closeModalButton = document.querySelector(".close-modal");
const modal = document.querySelector("#modal");

const input = document.querySelector(".search__input");
const searchButton = document.querySelector(".search__button");

const clearButton = document.querySelector(".search__clear-button");

const orderTemplate = document.querySelector(".order__template");
const orderProducts = document.querySelector(".order__products");

const backPage = document.querySelector(".back-page");
const nextPage = document.querySelector(".next-page");
const currentPage = document.querySelector(".current-page");

const limitSelect = document.querySelector(".limit__select");

const activeModal = document.querySelector(".modal__content--active");
const passiveModal = document.querySelector(".modal__content--passive");

const cost = document.querySelector(".quantity-cost");
const count = document.querySelector(".order__quantity");
const fullCost = document.querySelector(".order__amount-price");
const orderCount = document.querySelector(".order__full-count");
const orderPrice = document.querySelector(".order__full-price");

const sortProducts = document.querySelector(".goods__select");

const countInCart = document.querySelector(".count_cart");

const sortValue = {
  0: {
    sortBy: "id",
    order: "asc",
  },
  1: {
    sortBy: "title",
    order: "asc",
  },
  2: {
    sortBy: "title",
    order: "desc",
  },
  3: {
    sortBy: "price",
    order: "asc",
  },
  4: {
    sortBy: "price",
    order: "desc",
  },
  5: {
    sortBy: "rating",
    order: "desc",
  },
};

let activeCategory = null;
let search = "";
let basket = [];
let limit = 10;
let page = 1;
let maxPage = 2;
let sorting = 0;

limitSelect.addEventListener("change", () => {
  limit = limitSelect.value;

  page = 1;

  getProducts();
});

sortProducts.addEventListener("change", () => {
  sorting = sortProducts.value;

  getProducts();
});

backPage.addEventListener("click", () => {
  page--;
  currentPage.innerHTML = page;

  getProducts();

  if (page === 1) {
    backPage.disabled = true;
  } else {
    backPage.disabled = false;
  }

  nextPage.disabled = false;
});

nextPage.addEventListener("click", () => {
  page++;
  currentPage.innerHTML = page;

  getProducts();

  if (page === maxPage) {
    nextPage.disabled = true;
  } else {
    nextPage.disabled = false;
  }
  backPage.disabled = false;
});

openModalButton.addEventListener("click", () => {
  modal.classList.add("modal-open");
});

closeModalButton.addEventListener("click", () => {
  modal.classList.remove("modal-open");
});

searchButton.addEventListener("click", () => {
  search = input.value;

  page = 1;

  getProducts();
});

clearButton.addEventListener("click", () => {
  input.value = "";
  search = "";

  page = 1;

  getProducts();
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    search = input.value;

    page = 1;

    getProducts();
  }
});

getProducts();

function getProducts() {
  let url = "https://dummyjson.com/products";

  if (search) {
    activeCategory = null;
    url += `/search?q=${search}`;
  }

  if (activeCategory) {
    url += `/category/${activeCategory}`;
  }

  url += `?limit=${limit}&skip=${limit * (page - 1)}`;
  url += `&sortBy=${sortValue[sorting].sortBy}&order=${sortValue[sorting].order}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      maxPage = Math.ceil(data.total / limit);
      if (page === maxPage) {
        nextPage.disabled = true;
      } else {
        nextPage.disabled = false;
      }
      if (page === 1) {
        backPage.disabled = true;
      } else {
        backPage.disabled = false;
      }

      currentPage.innerHTML = page;

      renderProducts(data.products);
    })
    .catch((error) => {
      console.log(error);
      renderProducts(fakeResponse.products);
    });
}

fetch("https://dummyjson.com/products/category-list")
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    renderCategories(data.slice(0, 8));
  });

function renderProducts(products) {
  content.innerHTML = null;
  title.innerHTML = activeCategory ? activeCategory : "All Products";

  products.forEach((product) => {
    const clone = template.content.cloneNode(true);

    const image = clone.querySelector(".main__item-img");
    const title = clone.querySelector(".main__item-title");
    const description = clone.querySelector(".main__item-description");
    const price = clone.querySelector(".main__item-price");

    const orderButton = clone.querySelector(".main__item-btn");
    const orderButtonActive = clone.querySelector(".main__item-btn--active");

    orderButtonActive.style.display = "none";

    orderButtonActive.addEventListener("click", () => {
      modal.classList.add("modal-open");
      renderBasket();
    });

    orderButton.addEventListener("click", () => {
      orderButtonActive.style.display = "block";
      orderButton.style.display = "none";
      addToBasket(product);
    });

    image.src = product.thumbnail;
    title.innerHTML = product.title;
    description.innerHTML = product.description;
    price.innerHTML = `$ ${product.price}`;

    content.append(clone);
  });
}

function renderCategories(categories) {
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.classList.add("header__category");

    button.innerHTML = category;

    button.addEventListener("click", () => {
      const activeButton = document.querySelector(".header__category-active");

      page = 1;

      if (activeButton) {
        activeButton.classList.remove("header__category-active");
      }
      if (activeCategory === category) {
        button.classList.remove("header__category-active");
        activeCategory = null;
      } else {
        button.classList.add("header__category-active");
        activeCategory = category;
      }

      getProducts();
    });

    headerCategories.append(button);
  });
}

function addToBasket(product) {
  const basketProduct = basket.find((el) => el.id === product.id);
  if (basketProduct) {
    basketProduct.count++;
  } else {
    basket.push({
      ...product,
      count: 1,
    });
  }

  renderBasket();
}

function minusBasket(product) {
  const basketProduct = basket.find((el) => el.id === product.id);
  if (basketProduct) {
    basketProduct.count--;
  }

  renderBasket();
}

function deleteProduct(product) {
  basket = basket.filter((el) => el.id !== product.id);

  renderBasket();
}

function getFullPrice() {
  const sum = basket.reduce((sum, product) => {
    return sum + product.price * product.count;
  }, 0);
  return sum.toFixed(2);
}

function getFullCount() {
  const count = basket.reduce((sum, product) => sum + product.count, 0);
  return count;
}

function renderBasket() {
  orderProducts.innerHTML = null;
  if (basket.length === 0) {
    passiveModal.style.display = "flex";
    activeModal.style.display = "none";
    console.log(activeModal);
  } else {
    passiveModal.style.display = "none";
    activeModal.style.display = "flex";
  }

  basket.forEach((product) => {
    const clone = orderTemplate.content.cloneNode(true);

    const image = clone.querySelector(".order__img");
    const title = clone.querySelector(".order__title");
    const description = clone.querySelector(".order__description");
    const price = clone.querySelector(".order__price");
    const plus = clone.querySelector(".counter-btn--plus");
    const minus = clone.querySelector(".counter-btn--minus");
    const counterText = clone.querySelector(".order-counter");
    const deleteBtn = clone.querySelector(".order__close");

    image.src = product.thumbnail;
    title.innerHTML = product.title;
    description.innerHTML = product.description;
    price.innerHTML = `$ ${product.price}`;
    counterText.innerHTML = product.count;

    if (product.count == 1) {
      minus.disabled = true;
    } else {
      minus.disabled = false;
    }
    plus.addEventListener("click", () => {
      addToBasket(product);
    });

    minus.addEventListener("click", () => {
      minusBasket(product);
    });

    deleteBtn.addEventListener("click", () => {
      deleteProduct(product);
    });

    orderProducts.append(clone);
  });

  cost.innerHTML = "$ " + getFullPrice();
  count.innerHTML = "товар(а) " + getFullCount();
  fullCost.innerHTML = "$ " + getFullPrice();
  orderCount.innerHTML = getFullCount();
  orderPrice.innerHTML = "$ " + getFullPrice();
  countInCart.innerHTML = getFullCount() || "";
}

renderBasket();
