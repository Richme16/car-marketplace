const API_BASE_URL = `${API_ROOT}/api/services`;

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

const listContainer = document.getElementById("services-list");

async function loadRequests() {
  listContainer.innerHTML = `<p class="empty-state">Loading service requests...</p>`;

  try {
    const response = await fetch(API_BASE_URL, { headers: authHeaders() });
    if (response.status === 401) return handleAuthError();
    if (!response.ok) throw new Error(`Server responded with ${response.status}`);

    const requests = await response.json();
    renderRequests(requests);
  } catch (error) {
    listContainer.innerHTML = `<p class="empty-state">Couldn't load service requests. Is the backend running?</p>`;
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

function renderRequests(requests) {
  if (requests.length === 0) {
    listContainer.innerHTML = `<p class="empty-state">No service requests yet.</p>`;
    return;
  }

  listContainer.innerHTML = requests
    .map((req) => {
      const carLabel = `${req.carYear} ${req.carMake} ${req.carModel}`;
      const isUpgrade = req.serviceType === "upgrade";

      return `
      <div class="booking-card" data-id="${req._id}">
        <div class="booking-card-header">
          <div>
            <strong>${carLabel}</strong>
            <span class="tag ${isUpgrade ? "tag-rent" : "tag-sale"} inline-tag">
              ${isUpgrade ? "Upgrade" : "Repair"}
            </span>
          </div>
          <select class="status-select" data-id="${req._id}">
            <option value="pending" ${req.status === "pending" ? "selected" : ""}>Pending</option>
            <option value="contacted" ${req.status === "contacted" ? "selected" : ""}>Contacted</option>
            <option value="in_progress" ${req.status === "in_progress" ? "selected" : ""}>In Progress</option>
            <option value="completed" ${req.status === "completed" ? "selected" : ""}>Completed</option>
            <option value="cancelled" ${req.status === "cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </div>

        <div class="booking-card-body">
          <p><strong>${req.customerName}</strong></p>
          <p class="admin-row-meta">${req.customerEmail} · ${req.customerPhone}</p>
          ${req.preferredDate ? `<p class="admin-row-meta">Preferred date: ${formatDate(req.preferredDate)}</p>` : ""}
          <p class="booking-message">"${req.description}"</p>
          <p class="booking-timestamp">Submitted ${formatDate(req.createdAt)}</p>
        </div>

        <div class="admin-row-actions">
          <button class="btn btn-danger" data-action="delete" data-id="${req._id}">Delete</button>
        </div>
      </div>
    `;
    })
    .join("");
}

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
    alert("Couldn't update this request's status.");
    console.error(error);
    loadRequests();
  }
});

listContainer.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action='delete']");
  if (!btn) return;

  const confirmed = confirm("Delete this service request?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${btn.dataset.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (response.status === 401) return handleAuthError();
    if (!response.ok) throw new Error("Delete failed");
    loadRequests();
  } catch (error) {
    alert("Couldn't delete this request.");
    console.error(error);
  }
});

// ============ INITIAL LOAD ============
loadRequests();
