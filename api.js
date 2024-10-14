let products = [];
let cart = [];

window.onload = async () => {
  try {
    const response = await axios.get("http://localhost:8000/Product");
    products = response.data;

    // ตรวจสอบว่ามีข้อมูลตะกร้าใน localStorage หรือไม่
    const savedCart = localStorage.getItem("cart");
    const savedTotalPrice = localStorage.getItem("totalPrice");
    const savedCartItemsCount = localStorage.getItem("cartItemsCount");
    localStorage.removeItem("cart"); // ตัวเลือก: ตรวจสอบให้แน่ใจว่า localStorage ก็ถูกรีเซ็ต
    updateCartNumber(); // อัพเดต UI ของจำนวนสินค้าในตะกร้าให้แสดง 0

    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCart(); // อัพเดตตะกร้าทันทีหลังโหลดข้อมูล
    }

    if (savedTotalPrice) {
      const totalPriceDOM = document.querySelector("#totalPrice");
      if (totalPriceDOM) {
        totalPriceDOM.textContent = Number(savedTotalPrice).toLocaleString(); // ตรวจสอบว่าเป็น string และใส่เครื่องหมาย ','
      }
    }

    if (savedCartItemsCount) {
      const cartNumberDOM = document.querySelector("#cartNumber");
      cartNumberDOM.textContent = savedCartItemsCount;
      cartNumberDOM.style.display = "block";
    }

    filter("All"); // แสดงสินค้าทั้งหมดในหน้าแรก
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

//ค้นหา
const searchProduct = () => {
  const searchValue = document
    .querySelector("#searchInput")
    .value.toLowerCase(); // รับค่าจาก input และแปลงเป็นตัวพิมพ์เล็ก
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchValue)
  ); // กรองสินค้าที่ชื่อตรงกับค่าที่พิมพ์
  displayProducts(filteredProducts); // แสดงสินค้าที่กรองแล้ว
};

//แสดงสินค้าทั้งหมด หรือเปลี่ยนตาม para ที่รับเข้ามา
const displayProducts = (filteredProducts) => {
  const productDOM = document.querySelector(".Product-Container");

  let htmlData = "";
  if (filteredProducts.length === 0) {
    htmlData = `<div class="not-found">NOT FOUND</div>`;
  } else {
    filteredProducts.forEach((product) => {
      // ใช้ toLocaleString() เพื่อแปลงราคาสินค้าให้มี ,
      const formattedPrice = Number(product.price).toLocaleString();

      htmlData += `<div class="Card" data-type="${product.type}">
        <div class="show-img">
          <img src="${product.img}" alt="Product" class="default-img" />
          <img src="${product.img_hover}" alt="Hover" class="hover-img" />
        </div>
        <h3>${product.name}</h3>
        <p>${formattedPrice} ฿</p>
        <div class="btn">
          <p class="show-add">เพิ่มไปยังตะกร้าแล้ว</p>
          <button onclick="addtoCart(${product.id}, this)">
            <i class="fa-solid fa-cart-shopping"></i>
          </button>
        </div>
      </div>`;
    });
  }
  productDOM.innerHTML = htmlData;
};

//กรองตามที่เรากดรับ type มา
const filter = (type) => {
  let filteredProducts;

  if (type === "All") {
    filteredProducts = products;
  } else {
    filteredProducts = products.filter((product) => product.type === type);
  }

  displayProducts(filteredProducts);
};

const addtoCart = (productId, showadd) => {
  const showAddElement = showadd.parentElement.querySelector(".show-add");
  if (showAddElement) {
    showAddElement.style.display = "block";

    setTimeout(() => {
      showAddElement.style.display = "none";
    }, 1000);
  }

  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const productInCart = cart.find((item) => item.id === productId);

  if (productInCart) {
    productInCart.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart(); // อัพเดตตะกร้า
  updateCartNumber(); // อัพเดตจำนวนสินค้าในตะกร้า
  localStorage.setItem("cart", JSON.stringify(cart)); // เก็บใน localStorage

  // ตรวจสอบว่ากำลังแสดงตัวเลขหรือข้อมูลที่ไม่ถูกต้องหรือไม่
  const cartNumberDOM = document.querySelector("#cartNumber");
  if (cartNumberDOM && typeof cartNumberDOM.textContent !== "string") {
    cartNumberDOM.textContent = cartNumberDOM.textContent.toString();
  }
};

//อัพเดทของในตะกร้่า
const updateCart = () => {
  const cartDOM = document.querySelector(".Cart-list-container");
  const totalPriceDOM = document.querySelector("#totalPrice");

  let cartHTML = "";
  let totalPrice = 0;

  cart.forEach((product, index) => {
    cartHTML += `
      <div class="Cart-list">
        <div class="Cart-left">
          <img src="${product.img}" alt="Product" />
          <div class="Cart-detail">
            <p>${product.name}</p>
            <p>${product.price.toLocaleString()} ฿</p>
          </div>
        </div>
        <div class="Cart-Right">
          <button class="btn-list" onclick="decreaseQuantity(${index})">-</button>
          <p>${product.quantity}</p>
          <button class="btn-list" onclick="increaseQuantity(${index})">+</button>
        </div>
      </div>`;

    totalPrice += product.price * product.quantity;
  });

  cartDOM.innerHTML = cartHTML;

  // แปลงค่า totalPrice เป็น string ก่อนแสดงผล และตรวจสอบค่า NaN
  if (!isNaN(totalPrice)) {
    totalPriceDOM.textContent = totalPrice.toLocaleString();
    localStorage.setItem("totalPrice", totalPrice);
  } else {
    console.error("Error: totalPrice is NaN.");
    totalPriceDOM.textContent = "0"; // ถ้ามีข้อผิดพลาด จะแสดง 0 แทน NaN
  }
};

//เปลี่ยนเลขตามของที่อยู่ใน Array
const updateCartNumber = () => {
  const cartNumberDOM = document.querySelector("#cartNumber");
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (totalItems > 0) {
    cartNumberDOM.textContent = totalItems;
    cartNumberDOM.style.display = "block";
  } else {
    cartNumberDOM.style.display = "none";
  }
  localStorage.setItem("cartItemsCount", totalItems);
};

//เพิ่มสินค้า
const increaseQuantity = (index) => {
  cart[index].quantity += 1;

  updateCart();
  updateCartNumber();
  localStorage.setItem("cart", JSON.stringify(cart));

  // คำนวณยอดรวมใหม่และเก็บใน localStorage
  const totalPrice = cart.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );
  if (!isNaN(totalPrice)) {
    localStorage.setItem("totalPrice", totalPrice);
  } else {
    console.error("Error: totalPrice is NaN.");
  }
};

//ลดสินค้า
const decreaseQuantity = (index) => {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }

  updateCart();
  updateCartNumber();
  localStorage.setItem("cart", JSON.stringify(cart));

  // คำนวณยอดรวมใหม่และเก็บใน localStorage
  const totalPrice = cart.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );
  if (!isNaN(totalPrice)) {
    localStorage.setItem("totalPrice", totalPrice);
  } else {
    console.error("Error: totalPrice is NaN.");
  }
};
