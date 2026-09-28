document.addEventListener("DOMContentLoaded", () => {
  // 1. Array of contact information
  const contactData = [
    {
      title: "Contact Info",
      details: ["+62 83182719413", "contact.adyfas@gmail.com"],
    },
  ];
  const contactContainer = document.getElementById("contact-info-container");

  if (contactContainer) {
    let htmlContent = "";
    contactData.forEach((section) => {
      let detailsHtml = section.details
        .map((detail, index) => `<p class="mb-2 fade-in"  data-once="true"
            data-delay="0.2" data-duration="${0.8 * index+1}">${detail}</p>`)
        .join("");
      htmlContent += `
                <div class="flex flex-col text-black-main/60">
                    <h3 class="font-bold text-black-main mb-4 reveal" data-once="true"
            data-delay="0.2" data-duration="0.8" data-mode="word">${section.title}</h3>
                    ${detailsHtml}
                </div>
            `;
    });
    contactContainer.innerHTML = htmlContent;
  }
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;
      const targetUrl = new URL("https://adyfas.com/contact");
      targetUrl.searchParams.append("name", name);
      targetUrl.searchParams.append("email", email);
      targetUrl.searchParams.append("mess", message);
      window.location.href = targetUrl.toString();
    });
  }
});
