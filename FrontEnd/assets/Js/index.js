export let works = []; //pour manipuler les données de manière dynamique.

export async function generateImages() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const data = await response.json();

    works = data; // Store fetched data in the 'works' array
    const gallery = document.getElementById("galleryContainer");
    gallery.innerHTML = ""; // Clear current gallery

    works.forEach((article) => {
      const imageElement = document.createElement("img");
      imageElement.src = article.imageUrl;
      imageElement.alt = article.title;
      imageElement.dataset.categoryId = article.categoryId;

      const figCaptionElement = document.createElement("figcaption");
      figCaptionElement.innerText = article.title;

      // Create a figure element to contain the image and its caption
      const sectionFigure = document.createElement("figure");
      sectionFigure.appendChild(imageElement);
      sectionFigure.appendChild(figCaptionElement);

      gallery.appendChild(sectionFigure);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

generateImages();

// Filters

async function generateFilters(categories) {
  const portfolioSection = document.getElementById("filters");
  portfolioSection.innerHTML = "";
  const filterContainer = document.createElement("div");
  filterContainer.classList.add("filter-container");

  // ajouté le bouton Tous
  const tous = document.createElement("button");
  tous.textContent = "Tous";
  tous.classList.add("filter-button");
  tous.dataset.categoryId = "0";
  tous.addEventListener("click", handleFilterClick);
  filterContainer.appendChild(tous);

  categories.forEach((category) => {
    const { name, id } = category;
    const filterButton = document.createElement("button");
    filterButton.textContent = name;
    filterButton.classList.add("filter-button");
    filterButton.dataset.categoryId = id.toString();
    filterButton.addEventListener("click", handleFilterClick);
    filterContainer.appendChild(filterButton);
  });

  portfolioSection.insertBefore(filterContainer, portfolioSection.firstChild);
}

function handleFilterClick(event) {
  const categoryId = event.target.dataset.categoryId;

  const allImages = document.querySelectorAll(".gallery img");
  allImages.forEach((image) => {
    const imageCategory = image.dataset.categoryId;
    if (categoryId === "0" || imageCategory === categoryId) {
      image.parentElement.style.display = "block";
    } else {
      image.parentElement.style.display = "none";
    }
  });
}

async function showCategories() {
  try {
    // Fetch categories if the array is empty
    const response = await fetch("http://localhost:5678/api/categories");
    const data = await response.json();
    generateFilters(data); // Dynamically generate filters after fetching
  } catch (error) {
    console.error("Error displaying categories:", error);
  }
}

showCategories();

// Logout

// Function to create the logout button
function createLogoutButton() {
  const logoutButton = document.createElement("a");
  logoutButton.textContent = "logout";
  logoutButton.href = "#";

  logoutButton.addEventListener("click", function (event) {
    event.preventDefault();
    // remove the authentication token
    localStorage.removeItem("loginResponse");
    window.location.href = "./login.html";
  });

  return logoutButton;
}

// Function to replace login button with logout button
function replaceLoginWithLogout() {
  const loginButton = document.getElementById("js-login-button");
  const logoutButton = createLogoutButton();

  loginButton.parentNode.replaceChild(logoutButton, loginButton);
}

// Check if the user is logged in
const isLoggedIn = localStorage.getItem("loginResponse") !== null;

if (isLoggedIn) {
  replaceLoginWithLogout();
}
