document.addEventListener("DOMContentLoaded", () => {
  // 1. Array of contact information
  const contactData = [
    {
      title: "Contact Info",
      details: ["+62 83182719413", "contact.adyfas@gmail.com"],
    },
    // {
    //     title: "Address",
    //     details: [
    //         "+1 222 33 2000",
    //         "info@nuclaratx.ai",
    //         "info@nuclaratx.ai"
    //     ]
    // }
  ];

  // 2. Render contact information to DOM
  const contactContainer = document.getElementById("contact-info-container");

  if (contactContainer) {
    let htmlContent = "";
    contactData.forEach((section) => {
      let detailsHtml = section.details
        .map((detail) => `<p class="mb-2">${detail}</p>`)
        .join("");
      htmlContent += `
                <div class="flex flex-col text-black-main/60">
                    <h3 class="font-bold text-black-main mb-4">${section.title}</h3>
                    ${detailsHtml}
                </div>
            `;
    });
    contactContainer.innerHTML = htmlContent;
  }

  // 3. Handle Form Submission
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;

      // Construct the URL with parameters
      const targetUrl = new URL("https://adyfas.com/contact");
      targetUrl.searchParams.append("name", name);
      targetUrl.searchParams.append("email", email);
      targetUrl.searchParams.append("mess", message);

      // Redirect to the constructed URL
      window.location.href = targetUrl.toString();
    });
  }
});
