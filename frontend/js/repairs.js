// ============ API CONFIG ============
const SERVICE_API_URL = `${API_ROOT}/api/services`;

// ============ DOM REFERENCES ============
const form = document.getElementById("service-form");
const errorMsg = document.getElementById("service-error");
const successMsg = document.getElementById("service-success");
const submitBtn = document.getElementById("service-submit-btn");

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

    // 2. Show success message
    form.hidden = true;
    successMsg.hidden = false;

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

    // 4. Auto-open WhatsApp after a short delay
    setTimeout(() => {
      window.open(waUrl, "_blank");
    }, 800);

  } catch (error) {
    errorMsg.textContent = "Something went wrong. Please try again.";
    errorMsg.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Send request";
    console.error(error);
  }
});