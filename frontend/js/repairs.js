// ============ API CONFIG ============
const SERVICE_API_URL = `${API_ROOT}/api/services`;

// ============ DOM REFERENCES ============
const form = document.getElementById("service-form");
const errorMsg = document.getElementById("service-error");
const submitBtn = document.getElementById("service-submit-btn");

// ============ SUCCESS ANIMATION HELPER ============
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

// ============ FORM SUBMIT ============
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  const serviceData = {
    serviceType: document.getElementById("serviceType").value,
    preferredDate: document.getElementById("preferredDate").value,
    carMake: document.getElementById("carMake").value.trim(),
    carModel: document.getElementById("carModel").value.trim(),
    carYear: Number(document.getElementById("carYear").value),
    description: document.getElementById("description").value.trim(),
    customerName: document.getElementById("customerName").value.trim(),
    customerPhone: document.getElementById("customerPhone").value.trim(),
  };

  // ========== STEP 1: Build WhatsApp message ==========
  const waLines = [
    `*New ${serviceData.serviceType === "repair" ? "Repair" : "Upgrade"} Request*`,
    ``,
    `*Car:* ${serviceData.carYear} ${serviceData.carMake} ${serviceData.carModel}`,
    `*Details:* ${serviceData.description}`,
  ];
  if (serviceData.preferredDate) {
    waLines.push(`*Preferred date:* ${serviceData.preferredDate}`);
  }
  waLines.push(
    ``,
    `*Name:* ${serviceData.customerName}`,
    `*Phone:* ${serviceData.customerPhone}`
  );

  const waText = waLines.join("\n");

  // ========== STEP 2: Open WhatsApp IMMEDIATELY on user click ==========
  // Using api.whatsapp.com instead of wa.me — more reliable, avoids popup blocks.
  const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(waText)}`;
  window.open(waUrl, "_blank");

  // ========== STEP 3: Save to database in background ==========
  try {
    const response = await fetch(SERVICE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData),
    });

    if (!response.ok) throw new Error("Failed to submit request");

    // Show success animation (WhatsApp already opened)
    showSuccessAnimation(form, {
      title: "Request sent!",
      subtitle: `Your ${serviceData.serviceType === "repair" ? "repair" : "upgrade"} request for the ${serviceData.carYear} ${serviceData.carMake} ${serviceData.carModel} was received.`,
      note: "WhatsApp opened — tap send there",
    });

  } catch (error) {
    errorMsg.textContent = "Request couldn't be saved, but WhatsApp is still open — send the message there to complete your request.";
    errorMsg.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Send request";
    console.error(error);
  }
});