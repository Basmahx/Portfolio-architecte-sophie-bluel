import { generateImages, works } from "./index.js";

// retireve login response from the local storage
const loggedIn = JSON.parse(localStorage.getItem("loginResponse"));

// global variables
const modalContainer = document.getElementById("modalContainer");
const galleryContainer = document.getElementById("modalGalleryContainer");
const formContainer = document.querySelector(".formContainer2");
const closeModalIcon = document.getElementById("closeModalIcon");
const titleInput = document.getElementById("title");
const imageInput = document.getElementById("image");
const submitButton = document.querySelector(".button-add-photo-form");

/// Authentication Check ///

if (loggedIn != undefined) {
  const filters = document.getElementById("filters");
  if (filters) {
    filters.style.display = "none";
  }

  const modeEdition = document.querySelector(".modeEdition");
  if (modeEdition) {
    modeEdition.style.display = "flex";
  }

  const modifierButton = document.getElementById("modifierButton");
  if (modifierButton) {
    modifierButton.style.display = "block";
  }
}

// Event listener for opening the modal
document
  .querySelector("#modifierButton")
  .addEventListener("click", function (e) {
    e.preventDefault();
    if (modalContainer) {
      modalContainer.style.display = "flex"; // Show the modal
      modalContainer.removeAttribute("aria-hidden");
      modalContainer.setAttribute("aria-modal", "true");
    } else {
      console.error("Modal container not found");
    }
  });

// Event listener for closing the modal
document.addEventListener("click", function (e) {
  if (e.target === closeModalIcon || e.target === modalContainer) {
    modalContainer.style.display = "none"; // Hide the modal
    modalContainer.setAttribute("aria-hidden", "true");
    modalContainer.removeAttribute("aria-modal");
  }
});

// generate images
async function generateImagesModal() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();
    const gallery = document.getElementById("modalGallery");
    gallery.innerHTML = "";
    // Loop to create elements
    works.forEach((article) => {
      const imageElement = document.createElement("img");
      imageElement.src = article.imageUrl;
      imageElement.alt = article.title;

      const figure = document.createElement("figure");
      figure.appendChild(imageElement);

      const span = document.createElement("span");
      const trashCan = document.createElement("i");
      trashCan.classList.add("fa-solid", "fa-trash-can");
      trashCan.setAttribute("data-image-id", article.id); // Set data-image-id attribute for the delete button

      span.appendChild(trashCan);
      figure.appendChild(span);
      gallery.appendChild(figure);

      trashCan.addEventListener("click", handleDeleteClick);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

generateImagesModal();

// display categories dynamically

async function showCategoriesModal() {
  const select = document.getElementById("categoryInput");

  try {
    const response = await fetch("http://localhost:5678/api/categories");
    const data = await response.json();
    data.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error displaying categories:", error);
  }
}

showCategoriesModal();

//// API functions post & delete, using authentification token////

const postImageAPI = async (e) => {
  e.preventDefault();
  const formData = new FormData(formAddPhoto);
  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${loggedIn.token}` },
    });

    const addedImage = await response.json();
    if (response.ok) {
      // Add the new image to the works' array and re-render the galleries
      works.push(addedImage);
      generateImages(works, "galleryContainer"); // Update the DOM
      generateImagesModal(works, "modalGallery");
      goToGalleryPage();
    } else {
      console.error("Failed to add image:", await response.text());
    }
  } catch (error) {
    console.error("Error adding image:", error);
  }
};

async function handleDeleteClick(e) {
  e.preventDefault();
  const trashCan = e.target;
  const articleId = trashCan.getAttribute("data-image-id");

  if (articleId) {
    try {
      const response = await fetch(
        `http://localhost:5678/api/works/${articleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${loggedIn.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const modalImageFigure = document.querySelector(
          `figure[data-image-id="${articleId}"]`
        );
        if (modalImageFigure) {
          modalImageFigure.remove();
        }

        const imageElement = trashCan.closest("figure");
        if (imageElement) {
          imageElement.remove();
        }

        // Re-render the galleries
        generateImages(works, "galleryContainer");
        generateImagesModal(works, "modalGallery");
      } else {
        console.error("Error deleting image:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  }
}

// switch between the the 1st and the 2nd page in the modal

document
  .getElementById("toggleContentButton")
  .addEventListener("click", function () {
    // Hide gallery, show form
    galleryContainer.classList.remove("active");
    formContainer.classList.add("active");
  });

function goToGalleryPage() {
  // Hide form, show gallery
  formContainer.classList.remove("active");
  galleryContainer.classList.add("active");
}

document
  .querySelector(".fa-arrow-left")
  .addEventListener("click", goToGalleryPage);

//Preview the uploaded image before validating
function previewImage() {
  const file = document.getElementById("image").files[0]; // Pour accéder aux éléments d'un tableau JSON, utilisez l'indice (0-indexé).
  const reader = new FileReader();

  reader.onload = function (e) {
    // Set the preview image source to the file data
    document
      .getElementById("previewImage")
      .setAttribute("src", e.target.result);
    document.querySelector(".container-add-photo").style.display = "none";
    document.querySelector(".previewImageDiv").style.display = "block";
  };

  if (file) {
    reader.readAsDataURL(file); // Start reading the file data
  }
}

document.getElementById("image").addEventListener("change", previewImage);
document
  .getElementById("formAddPhoto")
  .addEventListener("submit", postImageAPI);

// to turn the form button green only when the form is completed
const turnButtonGreen = () => {
  // are the fields empty?
  if (titleInput.value.trim() !== "" && imageInput.files.length > 0) {
    submitButton.style.backgroundColor = "#1d6154";
  } else {
    submitButton.style.backgroundColor = "#a7a7a7";
  }
};

titleInput.addEventListener("input", turnButtonGreen);
imageInput.addEventListener("change", turnButtonGreen);

turnButtonGreen();
