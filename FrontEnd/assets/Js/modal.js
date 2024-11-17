// retireve from the local storage
const loggedIn = JSON.parse(localStorage.getItem("loginResponse"));

// global variables
const modalContainer = document.getElementById("modalContainer");
const galleryContainer = document.getElementById("modalGalleryContainer");
const formContainer = document.querySelector(".formContainer2");

/// Authentication Check ///

if (loggedIn != undefined) {
  //  à exécuter si loggedIn est défini
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

//to open and close the modal

const openModal = function (e) {
  e.preventDefault();
  if (modalContainer) {
    modalContainer.style.display = "flex";
    modalContainer.removeAttribute("aria-hidden");
    modalContainer.setAttribute("aria-modal", "true");
    localStorage.setItem("modalOpen", "true");
  } else {
    console.error("Modal container not found");
  }
};

document.querySelector("#modifierButton").addEventListener("click", openModal);

document.addEventListener("click", function (e) {
  if (e.target === closeModalIcon || e.target === modalContainer) {
    modalContainer.style.display = "none";
    localStorage.removeItem("modalOpen");
  }
});

const isModalOpen = localStorage.getItem("modalOpen");

// If modal state is stored and true, open the modal
if (isModalOpen === "true") {
  modalContainer.style.display = "flex";
  modalContainer.removeAttribute("aria-hidden");
  modalContainer.setAttribute("aria-modal", "true");
}

// to generate images for the modal

function generateImagesModal(images, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  images.forEach((article) => {
    const imageElement = document.createElement("img");
    imageElement.src = article.imageUrl;
    imageElement.alt = article.title;

    const figure = document.createElement("figure");
    figure.appendChild(imageElement);

    const span = document.createElement("span");
    const trashCan = document.createElement("i");
    trashCan.classList.add("fa-solid", "fa-trash-can");
    trashCan.setAttribute("data-image-id", article.id); // Set data-image-id attribute

    span.appendChild(trashCan);
    figure.appendChild(span);

    container.appendChild(figure);
    trashCan.addEventListener("click", handleDeleteClick);
  });
}

async function showImagesModal() {
  try {
    const data =
      JSON.parse(localStorage.getItem("works")) || (await getImages());
    generateImagesModal(data, "modalGallery");
  } catch (error) {
    console.error("Error retrieving data from local storage:", error);
  }
}

showImagesModal();

// display categories dynamically

async function showCategoriesModal() {
  const select = document.getElementById("categoryInput");
  const categories = await getCategory();
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    select.appendChild(option);
  });
}
showCategoriesModal();

//// API functions post & delete ////

const postImageAPI = async (e) => {
  e.preventDefault();
  const formData = new FormData(formAddPhoto);
  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${loggedIn.token}` },
    });

    if (!response.ok) throw new Error("Erreur lors de l'envoi du fichier");

    const data = await response.json();
    console.log("File uploaded successfully:", data);

    // Update local storage
    const works = JSON.parse(localStorage.getItem("works")) || [];
    works.push(data);
    localStorage.setItem("works", JSON.stringify(works));

    showImagesModal();
    showImages();
    goToGalleryPage();
  } catch (error) {
    console.error("Erreur:", error);
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
        // Update local storage
        let works = JSON.parse(localStorage.getItem("works"));
        works = works.filter((work) => work.id !== parseInt(articleId));
        localStorage.setItem("works", JSON.stringify(works));

        const imageElement = trashCan.closest("figure");
        if (imageElement) {
          imageElement.remove();
        }

        showImagesModal();
        showImages();
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
