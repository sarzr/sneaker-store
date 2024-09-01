import {
  getSneakerBrands,
  getSneakers,
} from "../../apis/services/sneaker.service";
import { getUser } from "../../apis/services/user.service";
import { errorHandler } from "../libs/error-handler";
import debounce from "lodash.debounce";
import { removeSessionToken } from "../libs/session-manager";

const productsEl = document.getElementById("products");
const productBrands = document.getElementById("products-brand");
const username = document.getElementById("username");
const greeting = document.getElementById("greeting");
const pages = document.getElementById("page");
const searchInput = document.getElementById("searchInput");
const paginations = document.getElementById("paginations");
const bottomEls = document.getElementById("bottomEls");
const theMost = document.getElementById("theMost");
const notFoundEl = document.getElementById("notFoundEl");
const scrollBar = document.querySelector(".scrollBar");
const logOut = document.getElementById("logOut");
let totalPages;
let curPage = 1;
let selectedBrand = null;
let currentSearchValue = "";

async function get() {
  try {
    const user = await getUser();
    username.innerText = user.username;
  } catch (error) {
    errorHandler(error);
  }
}
get();

function updateGreeting() {
  const hour = new Date().getHours();

  let greetingTxt;

  if (hour >= 6 && hour < 12) {
    greetingTxt = "Good Morning 👋";
  } else if (hour >= 12 && hour < 17) {
    greetingTxt = "Good Afternoon 👋";
  } else if (hour >= 17 && hour < 20) {
    greetingTxt = "Good Evening 👋";
  } else {
    greetingTxt = "Good Night 👋";
  }
  greeting.innerText = greetingTxt;
}
updateGreeting();

async function getProducts(brand = selectedBrand, page = 1, search = "") {
  try {
    const params = { page, limit: 10, search };
    if (brand) {
      params.brands = brand;
    }

    const sneakersResponse = await getSneakers(params);
    const sneakers = sneakersResponse.data;

    totalPages = sneakersResponse.totalPages;

    productsEl.innerHTML = "";

    if (sneakers.length === 0) {
      notFoundSneaker(search);
    } else {
      sneakers.forEach((sneaker) => {
        const product = document.createElement("div");
        product.innerHTML = renderSneakers(sneaker);
        product.addEventListener("click", () => {
          window.location.href = `/sneakerItem.html?id=${sneaker.id}`;
        });
        productsEl.append(product);
      });
      pagination(page, totalPages);
      elementStyles(true);
    }
  } catch (error) {
    errorHandler(error);
  }
}

getProducts();

function renderSneakers(sneaker) {
  return `
    <img class="bg-[#F3F3F3] w-[182px] h-[182px] rounded-3xl" 
         src="${sneaker.imageURL}" 
         alt="${sneaker.name}" />
    <div class="mt-3">
      <h3 class="text-[20px] font-bold text-[#152536] font-Inter truncate">
        ${sneaker.name}
      </h3>
      <p class="text-[16px] font-semibold text-[#152536] font-Inter">
        $ ${sneaker.price}
      </p>
    </div>
  `;
}

function notFoundSneaker(searchValu) {
  const notFound = document.createElement("div");
  notFound.innerHTML = `
    <div class="flex justify-between items-baseline mt-6">
      <h2 class="font-bold text-[20px]">Results for "${searchValu}"</h2>
      <span class="font-bold text-[16px]">0 found</span>
    </div>
    <div class="flex flex-col items-center text-center font-Inter mt-12">
      <img src="./public/assets/images/1.png" alt="" />
      <h1 class="font-bold text-[25px] mt-2">Not Found</h1>
      <p class="text-[20px] mt-4">
        Sorry, the keyword you entered cannot be found, please check again or
        search with another keyword.
      </p>
    </div>
  `;
  notFoundEl.innerHTML = "";
  notFoundEl.append(notFound);
  elementStyles(false);
}

function elementStyles(show) {
  const display = show ? "flex" : "none";
  paginations.style.display = display;
  bottomEls.style.display = display;
  productsEl.style.display = show ? "grid" : "none";
  productBrands.style.display = display;
  theMost.style.display = display;
  scrollBar.style.display = show ? "block" : "none";
  notFoundEl.style.display = show ? "none" : "block";
}

function brandClicked(selectedBrandEl) {
  const allBrandEls = productBrands.querySelectorAll("div");
  allBrandEls.forEach((brandEl) => {
    brandEl.classList.remove("bg-[#343A40]", "text-white");
    brandEl.classList.add("border-2", "border-[#343A40]", "text-[#343A40]");
  });

  selectedBrandEl.classList.add(
    "bg-[#343A40]",
    "text-white",
    "py-[4px]",
    "px-[18px]"
  );
  selectedBrandEl.classList.remove(
    "border-2",
    "border-[#343A40]",
    "text-[#343A40]"
  );
  selectedBrand =
    selectedBrandEl.innerText === "All" ? null : selectedBrandEl.innerText;
}

async function loadBrands() {
  try {
    const brands = await getSneakerBrands();

    const allBrandsEl = document.createElement("div");
    allBrandsEl.className =
      "bg-[#343A40] rounded-3xl text-white w-full text-[17px] py-[4px] px-[18px] flex justify-center items-center cursor-pointer";
    allBrandsEl.innerText = "All";
    allBrandsEl.addEventListener("click", () => {
      getProducts();
      brandClicked(allBrandsEl);
    });
    productBrands.append(allBrandsEl);

    brands.forEach((brand) => {
      const brandEl = document.createElement("div");
      brandEl.className =
        "py-[3px] px-[10px] w-full border-2 border-[#343A40] rounded-3xl flex justify-center items-center whitespace-nowrap";
      brandEl.innerHTML = brand;
      brandEl.addEventListener("click", () => {
        getProducts(brand);
        brandClicked(brandEl);
      });
      productBrands.append(brandEl);
    });
  } catch (error) {
    errorHandler(error);
  }
}
loadBrands();

function pagination(page, totalPages) {
  pages.innerHTML = "";

  const maxPage = 5;
  const startPage = 1;
  const endPage = Math.min(maxPage, totalPages);

  for (let i = startPage; i <= endPage; i++) {
    const pageSpan = document.createElement("span");
    pageSpan.innerText = i;
    pageSpan.className = `px-3 py-1 ${
      i === page ? "bg-black text-white active" : "bg-gray-200"
    } rounded-md`;
    pageSpan.addEventListener("click", () => changePage(i));
    pages.append(pageSpan);
  }
}
function changePage(page) {
  getProducts(selectedBrand, page, currentSearchValue);
  pagination(page, totalPages);
}
searchInput.addEventListener(
  "keyup",
  debounce((event) => {
    const searchValue = event.target.value.trim();
    currentSearchValue = searchValue;
    searching(searchValue);
  }, 3000)
);
function searching(searchValue) {
  curPage = 1;
  getProducts(null, curPage, searchValue);
  pagination(curPage, totalPages);
}

logOut.addEventListener("click", (e) => {
  e.preventDefault();
  removeSessionToken();
  window.location.href = "./login";
});
