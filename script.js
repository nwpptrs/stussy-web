let showCart = document.querySelector(".Cart-all");
let bodyDOM = document.querySelector("body");
let closeCart = document.querySelector(".close");

showCart.addEventListener("click", () => {
  bodyDOM.classList.toggle("showCart");
});

closeCart.addEventListener("click", () => {
  bodyDOM.classList.toggle("showCart");
});
