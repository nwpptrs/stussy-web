let showCart = document.querySelector(".Cart-all");
let bodyDOM = document.querySelector("body");
let closeCart = document.querySelector(".close");

showCart.addEventListener("click", () => {
  bodyDOM.classList.toggle("showCart");
});

closeCart.addEventListener("click", () => {
  bodyDOM.classList.toggle("showCart");
});

document.getElementById("checkout-show").addEventListener("click", () => {
  alert("ขอบคุณสำหรับการสั่งซื้อ");
  cart = [];
  updateCart();
  updateCartNumber();
});
