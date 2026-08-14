// ============ MOCK DATA ============
// Later, this array will come from your backend/database instead.
const cars = [
  { id: 1, make: "Toyota", model: "Corolla", year: 2021, type: "sale", price: 14500, mileage: 22000 },
  { id: 2, make: "Honda", model: "CR-V", year: 2022, type: "rent", price: 45, mileage: 9000 },
  { id: 3, make: "Ford", model: "Mustang", year: 2020, type: "sale", price: 27800, mileage: 18000 },
  { id: 4, make: "Kia", model: "Sportage", year: 2023, type: "rent", price: 55, mileage: 4000 },
  { id: 5, make: "Hyundai", model: "Elantra", year: 2019, type: "sale", price: 11200, mileage: 41000 },
  { id: 6, make: "Nissan", model: "Rogue", year: 2022, type: "rent", price: 50, mileage: 12500 },
  { id: 7, make: "Chevrolet", model: "Malibu", year: 2021, type: "sale", price: 15900, mileage: 27000 },
  { id: 8, make: "BMW", model: "3 Series", year: 2020, type: "sale", price: 24800, mileage: 20500 },
];

// ============ DOM REFERENCES ============
const grid = document.getElementById("car-grid");
const resultsCount = document.getElementById("results-count");
const emptyState = document.getElementById("empty-state");
const form = document.getElementById("search-form");
const qInput = document.getElementById("q");
const typeSelect = document.getElementById("type");
const sortSelect = document.getElementById("sort");

// ============ RENDER A SINGLE CAR CARD ============
function carCardHTML(car) {
  const isRent = car.type === "rent";
  const priceLabel = isRent ? `$${car.price}/day` : `$${car.price.toLocaleString()}`;

  return `
    <article class="car-card">
      <div class="car-media">
        <span class="tag ${isRent ? "tag-rent" : "tag-sale"}">
          ${isRent ? "For Rent" : "For Sale"}
        </span>
        ${car.year} ${car.make}
      </div>
      <div class="car-body">
        <div>
          <h3 class="car-title">${car.make} ${car.model}</h3>
          <p class="car-sub">${car.year} · ${car.mileage.toLocaleString()} mi</p>
        </div>
        <div class="car-readout">
          <div class="readout-item">
            <span class="readout-value">${priceLabel}</span>
            <span class="readout-label">${isRent ? "Per day" : "Price"}</span>
          </div>
          <div class="readout-item">
            <span class="readout-value small">${car.mileage.toLocaleString()}</span>
            <span class="readout-label">Mileage</span>
          </div>
        </div>
        <div class="car-actions">
          <button class="btn btn-outline" data-action="details" data-id="${car.id}">Details</button>
          <button class="btn btn-primary" data-action="${isRent ? "rent" : "buy"}" data-id="${car.id}">
            ${isRent ? "Rent now" : "Buy now"}
          </button>
        </div>
      </div>
    </article>
  `;
}

// ============ FILTER + SORT + RENDER ============
function renderCars() {
  const query = qInput.value.trim().toLowerCase();
  const type = typeSelect.value;
  const sort = sortSelect.value;

  let filtered = cars.filter((car) => {
    const matchesQuery =
      !query ||
      `${car.make} ${car.model}`.toLowerCase().includes(query);
    const matchesType = type === "all" || car.type === type;
    return matchesQuery && matchesType;
  });

  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (sort === "mileage-asc") filtered.sort((a, b) => a.mileage - b.mileage);

  resultsCount.textContent = `${filtered.length} car${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  grid.innerHTML = filtered.map(carCardHTML).join("");
}

// ============ EVENTS ============
form.addEventListener("submit", (e) => {
  e.preventDefault();
  renderCars();
});
typeSelect.addEventListener("change", renderCars);
sortSelect.addEventListener("change", renderCars);

// Buy/Rent/Details button clicks (event delegation)
grid.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const car = cars.find((c) => c.id === Number(btn.dataset.id));
  alert(`${btn.dataset.action.toUpperCase()}: ${car.make} ${car.model} — this will open a real booking form once we build the backend.`);
});

// ============ INITIAL RENDER ============
renderCars();