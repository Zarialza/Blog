document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".header_nav a"); // Select all nav links
  const currentUrl = window.location.href; // Get current URL

  navLinks.forEach((link) => {
    console.log(link.href);
    console.log(currentUrl);

    if (link.href === currentUrl) {
      link.classList.add("active"); // Add 'active' class if URLs match
    }
  });
});
