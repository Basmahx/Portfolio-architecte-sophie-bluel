if (document.getElementById("loginForm")) {
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value; // value : récuperer la valeur saisie par l'utilisateur sur la page web
    const password = document.getElementById("password").value;

    if (email.trim() === "" || password.trim() === "") {
      alert("Veuillez remplir tous les champs");
      return;
    }

    submitLogin(email, password);
  });
} else {
  console.log("Login form not found on this page");
}

async function submitLogin(email, password) {
  try {
    const loginResponse = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      localStorage.setItem("loginResponse", JSON.stringify(data));
      document.location.href = "index.html";
    } else if (loginResponse.status === 401) {
      document.getElementById("errorMessage").textContent =
        "Nom d'utilisateur ou mot de passe incorrect";
    } else if (loginResponse.status === 404) {
      document.getElementById("errorMessage").textContent =
        "Utilisateur non trouvé";
    } else if (loginResponse.status === 500) {
      document.getElementById("errorMessage").textContent =
        "Erreur serveur, veuillez réessayer plus tard";
    } else {
      document.getElementById("errorMessage").textContent =
        "Erreur lors de la connexion: " + loginResponse.status;
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
  }
}
