const getApi = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

function generateImages(images, containerId) {
  const gallery = document.getElementById(containerId);
  gallery.innerHTML = "";

  // Loop through the images array and create HTML elements for each image
  images.forEach((article) => {
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
}

async function fetchDataAndDisplayImages() {
  try {
    const data = await getApi();
    console.log(data);
    generateImages(data, "galleryContainer"); // Si les données sont récupérées avec succès, on les passe à la fonction generateImages pour générer et afficher les images dans l'élément avec l'ID galleryContainer.
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchDataAndDisplayImages();

// Filters

async function generateFilters() {
  async function getCategory() {
    const response = await fetch("http://localhost:5678/api/categories");
    const data = await response.json();
    return data;
  }

  const categories = await getCategory();

  const portfolioSection = document.getElementById("filters");
  const filterContainer = document.createElement("div");
  filterContainer.classList.add("filter-container");

  categories.forEach((category) => {
    const { name, id } = category;
    const filterButton = document.createElement("button");
    filterButton.textContent = name;
    filterButton.classList.add("filter-button");
    filterButton.dataset.categoryId = id.toString();
    filterButton.addEventListener("click", handleFilterClick); // Function call
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
      // va récuperer les id des images
      image.parentElement.style.display = "block";
    } else {
      image.parentElement.style.display = "none";
    }
  });
}

async function initialize() {
  await fetchDataAndDisplayImages();
  generateFilters();
}

initialize();

// Logout

// Function to create the logout button
function createLogoutButton() {
  const logoutButton = document.createElement("a");
  logoutButton.textContent = "logout";
  logoutButton.href = "#";

  // Add event listener to handle logout action
  logoutButton.addEventListener("click", function (event) {
    event.preventDefault();
    // Clear the authentication token or any other relevant data from local storage
    localStorage.removeItem("loginResponse");
    // Redirect to the login page
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
