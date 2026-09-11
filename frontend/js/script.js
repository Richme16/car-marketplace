// ============ API CONFIG ============
const API_BASE_URL = `${API_ROOT}/api/cars`;

let allCars = [];

// ============ DOM REFERENCES ============
const grid = document.getElementById("car-grid");
const resultsCount = document.getElementById("results-count");
const emptyState = document.getElementById("empty-state");
const form = document.getElementById("search-form");
const qInput = document.getElementById("q");
const typeSelect = document.getElementById("type");

// ============ RENDER A SINGLE CAR CARD ============
function carCardHTML(car) {
  const isRent = car.type === "rent";
  const priceLabel = isRent ? `$${car.price}/day` : `$${car.price.toLocaleString()}`;
  const thumbnail = car.images && car.images.length ? car.images[0] : null;

  return `
    <article class="car-card">
      <a class="car-media" href="car-details.html?id=${car._id}">
        <span class="tag ${isRent ? "tag-rent" : "tag-sale"}">
          ${isRent ? "For Rent" : "For Sale"}
        </span>
        ${
          thumbnail
            ? `<img src="${thumbnail}" alt="${car.year} ${car.make} ${car.model}" class="car-image" loading="lazy" />`
            : `<svg viewBox="0 0 64 32" class="car-icon" aria-hidden="true">
                <path d="M6 22 L10 12 Q13 8 20 8 L40 8 Q47 8 50 12 L58 22 L58 26 L52 26 Q52 22 47 22 Q42 22 42 26 L22 26 Q22 22 17 22 Q12 22 12 26 L6 26 Z" fill="currentColor" />
                <circle cx="17" cy="26" r="4" fill="var(--off-white)" stroke="currentColor" stroke-width="2" />
                <circle cx="47" cy="26" r="4" fill="var(--off-white)" stroke="currentColor" stroke-width="2" />
              </svg>`
        }
      </a>
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
          <a class="btn btn-outline" href="car-details.html?id=${car._id}">Details</a>
          <button class="btn btn-primary" data-action="${isRent ? "rent" : "buy"}" data-id="${car._id}">
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

  let filtered = allCars.filter((car) => {
    const matchesQuery =
      !query || `${car.make} ${car.model}`.toLowerCase().includes(query);
    const matchesType = type === "all" || car.type === type;
    return matchesQuery && matchesType;
  });

  resultsCount.textContent = `${filtered.length} car${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  grid.innerHTML = filtered.map(carCardHTML).join("");
}

// ============ FETCH CARS FROM THE BACKEND ============
async function loadCars() {
  grid.innerHTML = `<p class="empty-state">Loading cars...</p>`;

  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error(`Server responded with ${response.status}`);

    allCars = await response.json();
    renderCars();
  } catch (error) {
    grid.innerHTML = "";
    emptyState.hidden = false;
    emptyState.textContent = `Couldn't load cars. Error details: ${error.name}: ${error.message}`;
    console.error("Failed to fetch cars:", error);
  }
}

// ============ EVENTS ============
form.addEventListener("submit", (e) => {
  e.preventDefault();
  renderCars();
});
typeSelect.addEventListener("change", renderCars);

grid.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const car = allCars.find((c) => c._id === btn.dataset.id);
  alert(`${btn.dataset.action.toUpperCase()}: ${car.make} ${car.model} — this will open a real booking form soon.`);
});

// ============ INITIAL LOAD ============
loadCars();
