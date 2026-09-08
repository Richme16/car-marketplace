const API_URL = `${API_ROOT}/api/services`;

const form = document.getElementById("service-form");
const errorMsg = document.getElementById("service-error");
const successMsg = document.getElementById("service-success");
const submitBtn = document.getElementById("service-submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  const requestData = {
    serviceType: document.getElementById("serviceType").value,
    preferredDate: document.getElementById("preferredDate").value || undefined,
    carMake: document.getElementById("carMake").value.trim(),
    carModel: document.getElementById("carModel").value.trim(),
    carYear: Number(document.getElementById("carYear").value),
    description: document.getElementById("description").value.trim(),
    customerName: document.getElementById("customerName").value.trim(),
    customerEmail: document.getElementById("customerEmail").value.trim(),
    customerPhone: document.getElementById("customerPhone").value.trim(),
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) throw new Error("Failed to submit request");

    form.hidden = true;
    successMsg.hidden = false;
  } catch (error) {
    errorMsg.textContent = "Something went wrong. Please try again.";
    errorMsg.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Send request";
    console.error(error);
  }
});
