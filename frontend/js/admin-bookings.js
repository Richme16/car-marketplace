const API_BASE_URL = "http://localhost:5000/api/bookings";

// ============ AUTH CHECK ============
const token = localStorage.getItem("motorline_admin_token");
if (!token) {
  window.location.href = "login.html";
}

function authHeaders(extra = {}) {
  return { Authorization: `Bearer ${token}`, ...extra };
}

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

const listContainer = document.getElementById("bookings-list");

// ============ LOAD BOOKINGS ============
async function loadBookings() {
  listContainer.innerHTML = `<p class="empty-state">Loading bookings...</p>`;

  try {
    const response = await fetch(API_BASE_URL, { headers: authHeaders() });
    if (response.status === 401) return handleAuthError();
    if (!response.ok) throw new Error(`Server responded with ${response.status}`);

    const bookings = await response.json();
    renderBookings(bookings);
  } catch (error) {
    listContainer.innerHTML = `<p class="empty-state">Couldn't load bookings. Is the backend running?</p>`;
    console.error(error);
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderBookings(bookings) {
  if (bookings.length === 0) {
    listContainer.innerHTML = `<p class="empty-state">No booking requests yet.</p>`;
    return;
  }

  listContainer.innerHTML = bookings
    .map((booking) => {
      const car = booking.car; // populated by the backend (make, model, year, etc.)
      const carLabel = car ? `${car.year} ${car.make} ${car.model}` : "Car no longer listed";

      return `
      <div class="booking-card" data-id="${booking._id}">
        <div class="booking-card-header">
          <div>
            <strong>${carLabel}</strong>
            <span class="tag ${booking.type === "rent" ? "tag-rent" : "tag-sale"} inline-tag">
              ${booking.type === "rent" ? "Rental" : "Purchase"}
            </span>
          </div>
          <select class="status-select" data-id="${booking._id}">
            <option value="pending" ${booking.status === "pending" ? "selected" : ""}>Pending</option>
            <option value="contacted" ${booking.status === "contacted" ? "selected" : ""}>Contacted</option>
            <option value="confirmed" ${booking.status === "confirmed" ? "selected" : ""}>Confirmed</option>
            <option value="cancelled" ${booking.status === "cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </div>

        <div class="booking-card-body">
          <p><strong>${booking.customerName}</strong></p>
          <p class="admin-row-meta">${booking.customerEmail} · ${booking.customerPhone}</p>
          ${
            booking.type === "rent" && booking.startDate
              ? `<p class="admin-row-meta">${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}</p>`
              : ""
          }
          ${booking.message ? `<p class="booking-message">"${booking.message}"</p>` : ""}
          <p class="booking-timestamp">Submitted ${formatDate(booking.createdAt)}</p>
        </div>

        <div class="admin-row-actions">
          <button class="btn btn-danger" data-action="delete" data-id="${booking._id}">Delete</button>
        </div>
      </div>
    `;
    })
    .join("");
}

// ============ STATUS CHANGE ============
listContainer.addEventListener("change", async (e) => {
  if (!e.target.classList.contains("status-select")) return;

  const id = e.target.dataset.id;
  const newStatus = e.target.value;

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ status: newStatus }),
    });
    if (response.status === 401) return handleAuthError();
    if (!response.ok) throw new Error("Failed to update status");
  } catch (error) {
    alert("Couldn't update this booking's status.");
    console.error(error);
    loadBookings(); // reload to revert the dropdown if the update failed
  }
});

// ============ DELETE BOOKING ============
listContainer.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action='delete']");
  if (!btn) return;

  const confirmed = confirm("Delete this booking request?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${btn.dataset.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (response.status === 401) return handleAuthError();
    if (!response.ok) throw new Error("Delete failed");
    loadBookings();
  } catch (error) {
    alert("Couldn't delete this booking.");
    console.error(error);
  }
});

// ============ INITIAL LOAD ============
loadBookings();
