// ============ API CONFIG ============
const API_BASE_URL = "http://localhost:5000/api/cars";
const UPLOAD_URL = "http://localhost:5000/api/upload";
const MAX_PHOTOS = 5;

// ============ AUTH CHECK ============
// If there's no saved token, this page shouldn't be usable — send to login.
const token = localStorage.getItem("motorline_admin_token");
if (!token) {
  window.location.href = "login.html";
}

// Helper: returns the headers needed for a request that requires login.
// Spread this into any fetch() that adds, edits, deletes, or uploads.
function authHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

// Helper: call this whenever a protected request comes back as 401
// (meaning the token is missing, invalid, or expired).
function handleAuthError() {
  localStorage.removeItem("motorline_admin_token");
  alert("Your session has expired. Please log in again.");
  window.location.href = "login.html";
}

document.getElementById("logout-link").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("motorline_admin_token");
  window.location.href = "login.html";
});

// Tracks whether we're currently editing a car (holds its _id) or adding a new one (null)
let editingId = null;

// Photos already saved to this car in the database (URLs, as strings).
// Populated when editing an existing car.
let existingImages = [];

// Newly selected photo files from the computer, not uploaded yet.
// Stored as File objects until the form is submitted.
let selectedFiles = [];

// ============ DOM REFERENCES ============
const form = document.getElementById("car-form");
const formHeading = document.getElementById("form-heading");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const listContainer = document.getElementById("admin-list");
const photosInput = document.getElementById("photos");
const uploadHint = document.getElementById("upload-hint");
const previewGrid = document.getElementById("photo-preview-grid");

const fields = {
  make: document.getElementById("make"),
  model: document.getElementById("model"),
  year: document.getElementById("year"),
  type: document.getElementById("listing-type"),
  price: document.getElementById("price"),
  mileage: document.getElementById("mileage"),
  transmission: document.getElementById("transmission"),
  fuel: document.getElementById("fuel"),
  color: document.getElementById("color"),
  seats: document.getElementById("seats"),
  description: document.getElementById("description"),
  features: document.getElementById("features"),
};

// ============ LOAD AND DISPLAY ALL CARS ============
async function loadCars() {
  listContainer.innerHTML = `<p class="empty-state">Loading listings...</p>`;

  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error(`Server responded with ${response.status}`);
    const cars = await response.json();
    renderList(cars);
  } catch (error) {
    listContainer.innerHTML = `<p class="empty-state">Couldn't load listings. Is the backend running?</p>`;
    console.error(error);
  }
}

function renderList(cars) {
  if (cars.length === 0) {
    listContainer.innerHTML = `<p class="empty-state">No listings yet. Add your first car above.</p>`;
    return;
  }

  listContainer.innerHTML = cars
    .map(
      (car) => `
    <div class="admin-row" data-id="${car._id}">
      <div class="admin-row-info">
        <strong>${car.year} ${car.make} ${car.model}</strong>
        <span class="admin-row-meta">
          ${car.type === "rent" ? `$${car.price}/day` : `$${car.price.toLocaleString()}`}
          · ${car.mileage.toLocaleString()} mi
          · ${car.type === "rent" ? "For rent" : "For sale"}
          · ${car.images && car.images.length ? `${car.images.length} photo${car.images.length !== 1 ? "s" : ""}` : "No photos"}
        </span>
      </div>
      <div class="admin-row-actions">
        <button class="btn btn-outline" data-action="edit" data-id="${car._id}">Edit</button>
        <button class="btn btn-danger" data-action="delete" data-id="${car._id}">Delete</button>
      </div>
    </div>
  `
    )
    .join("");
}

// ============ PHOTO SELECTION ============
photosInput.addEventListener("change", () => {
  const newFiles = Array.from(photosInput.files);
  const totalCount = existingImages.length + selectedFiles.length + newFiles.length;

  if (totalCount > MAX_PHOTOS) {
    alert(`You can have up to ${MAX_PHOTOS} photos total. Remove one before adding more.`);
    photosInput.value = ""; // clear the picked files so it doesn't stay in a bad state
    return;
  }

  selectedFiles = selectedFiles.concat(newFiles);
  photosInput.value = ""; // reset so selecting the same file again still fires "change"
  renderPreviews();
});

// Shows thumbnails for both already-saved images (existingImages) and
// newly picked files (selectedFiles), each with a small "remove" button.
function renderPreviews() {
  const totalCount = existingImages.length + selectedFiles.length;
  uploadHint.textContent =
    totalCount === 0
      ? "No photos selected yet."
      : `${totalCount} of ${MAX_PHOTOS} photos selected.`;

  const existingHTML = existingImages
    .map(
      (url, index) => `
    <div class="photo-preview-item existing">
      <img src="${url}" alt="Car photo ${index + 1}" />
      <button type="button" class="preview-remove" data-type="existing" data-index="${index}">&times;</button>
    </div>
  `
    )
    .join("");

  const newHTML = selectedFiles
    .map(
      (file, index) => `
    <div class="photo-preview-item">
      <img src="${URL.createObjectURL(file)}" alt="New photo ${index + 1}" />
      <button type="button" class="preview-remove" data-type="new" data-index="${index}">&times;</button>
    </div>
  `
    )
    .join("");

  previewGrid.innerHTML = existingHTML + newHTML;
}

// Handles clicking the little "×" remove button on any preview thumbnail
previewGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".preview-remove");
  if (!btn) return;

  const index = Number(btn.dataset.index);
  if (btn.dataset.type === "existing") {
    existingImages.splice(index, 1);
  } else {
    selectedFiles.splice(index, 1);
  }
  renderPreviews();
});

// ============ UPLOAD SELECTED FILES TO CLOUDINARY (via our backend) ============
async function uploadSelectedPhotos() {
  if (selectedFiles.length === 0) return [];

  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append("photos", file));

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: authHeaders(), // no Content-Type here — the browser sets it automatically for FormData
    body: formData,
  });

  if (response.status === 401) return handleAuthError();
  if (!response.ok) throw new Error("Photo upload failed");

  const data = await response.json();
  return data.urls; // array of Cloudinary URLs
}

// ============ BUILD A CAR OBJECT FROM THE FORM ============
function getFormData(uploadedUrls) {
  return {
    make: fields.make.value.trim(),
    model: fields.model.value.trim(),
    year: Number(fields.year.value),
    type: fields.type.value,
    price: Number(fields.price.value),
    mileage: Number(fields.mileage.value),
    transmission: fields.transmission.value,
    fuel: fields.fuel.value,
    color: fields.color.value.trim(),
    seats: Number(fields.seats.value) || 5,
    description: fields.description.value.trim(),
    features: fields.features.value
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean),
    images: [...existingImages, ...uploadedUrls],
  };
}

// ============ ADD OR UPDATE (SAME FORM HANDLES BOTH) ============
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  try {
    // Step 1: upload any newly-picked photos to Cloudinary first
    const uploadedUrls = await uploadSelectedPhotos();

    // Step 2: build the car object, now including all image URLs
    const carData = getFormData(uploadedUrls);

    // Step 3: save the car itself (create or update)
    let response;
    if (editingId) {
      response = await fetch(`${API_BASE_URL}/${editingId}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(carData),
      });
    } else {
      response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(carData),
      });
    }

    if (response.status === 401) return handleAuthError();
    if (!response.ok) throw new Error("Save failed");

    resetForm();
    loadCars();
  } catch (error) {
    alert("Something went wrong saving this car. Check the backend terminal for details.");
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editingId ? "Save changes" : "Add car";
  }
});

// ============ EDIT / DELETE BUTTON CLICKS (event delegation) ============
listContainer.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;

  if (btn.dataset.action === "delete") {
    const confirmed = confirm("Delete this listing? This can't be undone.");
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (response.status === 401) return handleAuthError();
      if (!response.ok) throw new Error("Delete failed");
      loadCars();
    } catch (error) {
      alert("Couldn't delete this listing.");
      console.error(error);
    }
  }

  if (btn.dataset.action === "edit") {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) throw new Error("Fetch failed");
      const car = await response.json();
      populateForm(car);
    } catch (error) {
      alert("Couldn't load this listing for editing.");
      console.error(error);
    }
  }
});

// ============ FILL THE FORM WITH AN EXISTING CAR'S DATA ============
function populateForm(car) {
  editingId = car._id;
  fields.make.value = car.make;
  fields.model.value = car.model;
  fields.year.value = car.year;
  fields.type.value = car.type;
  fields.price.value = car.price;
  fields.mileage.value = car.mileage;
  fields.transmission.value = car.transmission;
  fields.fuel.value = car.fuel;
  fields.color.value = car.color;
  fields.seats.value = car.seats;
  fields.description.value = car.description;
  fields.features.value = (car.features || []).join(", ");

  existingImages = [...(car.images || [])];
  selectedFiles = [];
  renderPreviews();

  formHeading.textContent = `Editing: ${car.make} ${car.model}`;
  submitBtn.textContent = "Save changes";
  cancelEditBtn.hidden = false;

  form.scrollIntoView({ behavior: "smooth" });
}

// ============ RESET FORM BACK TO "ADD" MODE ============
function resetForm() {
  editingId = null;
  existingImages = [];
  selectedFiles = [];
  form.reset();
  renderPreviews();
  formHeading.textContent = "Add a new car";
  submitBtn.textContent = "Add car";
  cancelEditBtn.hidden = true;
}

cancelEditBtn.addEventListener("click", resetForm);

// ============ INITIAL LOAD ============
loadCars();
