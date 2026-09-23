// ============ API CONFIG ============
const API_BASE_URL = `${API_ROOT}/api/cars`;

const params = new URLSearchParams(window.location.search);
const carId = params.get("id");
const actionParam = params.get("action");

const container = document.getElementById("details-content");

// ============ FETCH AND RENDER ============
async function loadCarDetails() {
  if (!carId) {
    showNotFound();
    return;
  }

  container.innerHTML = `<p class="empty-state">Loading car details...</p>`;

  try {
    const response = await fetch(`${API_BASE_URL}/${carId}`);
    if (!response.ok) throw new Error("Car not found");

    const car = await response.json();
    renderCar(car);

    if (actionParam === "buy" || actionParam === "rent") {
      openBookingModal(car);
    }
  } catch (error) {
    showNotFound();
    console.error("Failed to fetch car:", error);
  }
}

function showNotFound() {
  container.innerHTML = `
    <div class="not-found">
      <h1>Car not found</h1>
      <p>That listing doesn't exist, may have been removed, or the backend server isn't running.</p>
      <a class="btn btn-primary" href="index.html">Back to inventory</a>
    </div>
  `;
}

function renderCar(car) {
  const isRent = car.type === "rent";
  const priceLabel = isRent
    ? `GH₵${car.price.toLocaleString()}/day`
    : `GH₵${car.price.toLocaleString()}`;
  const images = car.images && car.images.length ? car.images : [];

  document.title = `${car.year} ${car.make} ${car.model} — Bra Kay Autotech`;

  container.innerHTML = `
    <div class="details-layout">
      <div class="details-media-col">
        <div class="details-media" id="main-image-wrap">
          <span class="tag ${isRent ? "tag-rent" : "tag-sale"}">
            ${isRent ? "For Rent" : "For Sale"}
          </span>
          ${
            images.length
              ? `<img src="${images[0]}" alt="${car.year} ${car.make} ${car.model}" class="details-image" id="main-image" />`
              : `<svg viewBox="0 0 64 32" class="car-icon large" aria-hidden="true">
                  <path d="M6 22 L10 12 Q13 8 20 8 L40 8 Q47 8 50 12 L58 22 L58 26 L52 26 Q52 22 47 22 Q42 22 42 26 L22 26 Q22 22 17 22 Q12 22 12 26 L6 26 Z" fill="currentColor" />
                  <circle cx="17" cy="26" r="4" fill="var(--off-white)" stroke="currentColor" stroke-width="2" />
                  <circle cx="47" cy="26" r="4" fill="var(--off-white)" stroke="currentColor" stroke-width="2" />
                </svg>`
          }
        </div>

        ${
          images.length > 1
            ? `
          <div class="thumbnail-row" id="thumbnail-row">
            ${images
              .map(
                (url, index) => `
              <button type="button" class="thumbnail-btn ${index === 0 ? "active" : ""}" data-src="${url}">
                <img src="${url}" alt="${car.make} ${car.model} photo ${index + 1}" loading="lazy" />
              </button>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>

      <div class="details-info">
        <h1>${car.year} ${car.make} ${car.model}</h1>
        <p class="details-price">${priceLabel}</p>
        <p class="details-description">${car.description || ""}</p>

        <div class="spec-grid">
          <div class="spec-item">
            <span class="spec-label">Mileage</span>
            <span class="spec-value">${car.mileage.toLocaleString()} mi</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Transmission</span>
            <span class="spec-value">${car.transmission}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Fuel type</span>
            <span class="spec-value">${car.fuel}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Color</span>
            <span class="spec-value">${car.color}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Seats</span>
            <span class="spec-value">${car.seats}</span>
          </div>
        </div>

        ${
          car.features && car.features.length
            ? `
          <h2 class="features-heading">Features</h2>
          <ul class="features-list">
            ${car.features.map((f) => `<li>${f}</li>`).join("")}
          </ul>
        `
            : ""
        }

        <div class="details-actions">
          <button class="btn btn-primary" id="action-btn">
            ${isRent ? "Rent this car" : "Buy this car"}
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("action-btn").addEventListener("click", () => {
    openBookingModal(car);
  });

  const thumbnailRow = document.getElementById("thumbnail-row");
  if (thumbnailRow) {
    thumbnailRow.addEventListener("click", (e) => {
      const btn = e.target.closest(".thumbnail-btn");
      if (!btn) return;

      document.getElementById("main-image").src = btn.dataset.src;

      thumbnailRow
        .querySelectorAll(".thumbnail-btn")
        .forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
    });
  }
}

// ============ INITIAL LOAD ============
loadCarDetails();

// ============ SUCCESS ANIMATION HELPER ============
// Replaces a form element with an animated success state
function showSuccessAnimation(formEl, options = {}) {
  const {
    title = "Request sent!",
    subtitle = "We'll be in touch soon.",
    note = "Opening WhatsApp...",
  } = options;

  const wrapper = document.createElement("div");
  wrapper.className = "success-anim";
  wrapper.innerHTML = `
    <svg class="success-svg" viewBox="0 0 100 100" aria-hidden="true">
      <circle class="success-circle-path" cx="50" cy="50" r="45" />
      <path class="success-check-path" d="M30 52 L45 67 L72 38" />
    </svg>
    <h3 class="success-title">${title}</h3>
    <p class="success-subtitle">${subtitle}</p>
    <p class="success-note">${note}</p>
  `;
  formEl.replaceWith(wrapper);
}

// ============ BOOKING MODAL ============
const BOOKING_API_URL = `${API_ROOT}/api/bookings`;

function openBookingModal(car) {
  const isRent = car.type === "rent";

  const modalHTML = `
    <div class="modal-overlay" id="booking-overlay">
      <div class="modal-box">
        <button type="button" class="modal-close" id="modal-close">&times;</button>
        <h2>${isRent ? "Rent" : "Buy"} the ${car.year} ${car.make} ${car.model}</h2>
        <p class="admin-sub">Fill in your details and we'll get back to you to confirm.</p>

        <form id="booking-form">
          <div class="field">
            <label for="customerName">Full name</label>
            <input type="text" id="customerName" required />
          </div>
          <div class="field">
            <label for="customerPhone">Phone</label>
            <input type="tel" id="customerPhone" required />
          </div>

          ${
            isRent
              ? `
            <div class="form-grid">
              <div class="field">
                <label for="startDate">Start date</label>
                <input type="date" id="startDate" required />
              </div>
              <div class="field">
                <label for="endDate">End date</label>
                <input type="date" id="endDate" required />
              </div>
            </div>
          `
              : ""
          }

          <div class="field">
            <label for="message">Message (optional)</label>
            <textarea id="message" rows="3" placeholder="Anything you'd like us to know..."></textarea>
          </div>

          <p id="booking-error" class="login-error" hidden></p>

          <button type="submit" class="btn btn-primary" id="booking-submit-btn">
            Send ${isRent ? "rental" : "purchase"} request
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const overlay = document.getElementById("booking-overlay");
  const closeBtn = document.getElementById("modal-close");
  const bookingForm = document.getElementById("booking-form");
  const errorMsg = document.getElementById("booking-error");
  const submitBtn = document.getElementById("booking-submit-btn");

  function closeModal() {
    overlay.remove();
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    const customerName = document.getElementById("customerName").value.trim();
    const customerPhone = document.getElementById("customerPhone").value.trim();
    const message = document.getElementById("message").value.trim();

    const bookingData = {
      car: car._id,
      type: car.type,
      customerName,
      customerPhone,
      message,
    };

    let startDate = "";
    let endDate = "";
    if (isRent) {
      startDate = document.getElementById("startDate").value;
      endDate = document.getElementById("endDate").value;
      bookingData.startDate = startDate;
      bookingData.endDate = endDate;
    }

    try {
      // 1. Save to database
      const response = await fetch(BOOKING_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) throw new Error("Failed to submit request");

      // 2. Play success animation (replaces the form)
      showSuccessAnimation(bookingForm, {
        title: "Request sent!",
        subtitle: `${isRent ? "Rental" : "Purchase"} request for the ${car.year} ${car.make} ${car.model} received.`,
        note: "Opening WhatsApp...",
      });

      // 3. Build WhatsApp message
      const waLines = [
        `*New ${isRent ? "Rental" : "Purchase"} Request*`,
        ``,
        `*Car:* ${car.year} ${car.make} ${car.model}`,
        `*Price:* ${isRent ? `GH₵${car.price.toLocaleString()}/day` : `GH₵${car.price.toLocaleString()}`}`,
        ``,
        `*Name:* ${customerName}`,
        `*Phone:* ${customerPhone}`,
      ];
      if (isRent) {
        waLines.push(`*Dates:* ${startDate} → ${endDate}`);
      }
      if (message) {
        waLines.push(``, `*Message:* ${message}`);
      }

      const waText = waLines.join("\n");
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

      // 4. Auto-open WhatsApp after the animation plays (~1.4s)
      setTimeout(() => {
        window.open(waUrl, "_blank");
      }, 1400);

    } catch (error) {
      errorMsg.textContent = "Something went wrong. Please try again.";
      errorMsg.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = `Send ${isRent ? "rental" : "purchase"} request`;
      console.error(error);
    }
  });
}