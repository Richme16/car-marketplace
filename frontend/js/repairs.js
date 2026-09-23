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

  try {
    // 1. Save to database
    const response = await fetch(SERVICE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData),
    });

    if (!response.ok) throw new Error("Failed to submit request");

    // 2. Play success animation (replaces the form)
    showSuccessAnimation(form, {
      title: "Request sent!",
      subtitle: `Your ${serviceData.serviceType === "repair" ? "repair" : "upgrade"} request for the ${serviceData.carYear} ${serviceData.carMake} ${serviceData.carModel} was received.`,
      note: "Opening WhatsApp...",
    });

    // 3. Build WhatsApp message
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
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

    // 4. Auto-open WhatsApp after the animation plays
    setTimeout(() => {
      window.open(waUrl, "_blank");
    }, 1400);

  } catch (error) {
    errorMsg.textContent = "Something went wrong. Please try again.";
    errorMsg.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Send request";
    console.error(error);
  }
});