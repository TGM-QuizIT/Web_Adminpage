<template>
  <div class="page-container">
    <h1>Login</h1>
    <p class="login-info">
      Bitte melden Sie sich mit Ihren TGM-Anmeldedaten an!
    </p>
    <div class="login-container">
      <form @submit="tryLogin">
        <label for="username">Benutzername</label>
        <input
            type="text"
            id="username"
            v-model="username"
            name="username"
            required
        />

        <label for="password">Passwort</label>
        <input
            type="password"
            id="password"
            v-model="password"
            name="password"
            required
        />

        <button type="submit">Login</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {useRouter} from "vue-router";
import axios from "axios";

const router = useRouter();
const username = ref("");
const password = ref("");
const errorMessage = ref("");

async function tryLogin(event) {
  event.preventDefault();
  errorMessage.value = "";

  try {
    const response = await axios.post(
        "https://projekte.tgm.ac.at/quizit/api/user/login",
        {
          userName: username.value,
          password: password.value,
        },
        {
          headers: {
            authorization: "2e5c9ed5-c5f5-458a-a1cb-40b6235b052a",
          },
        }
    );

    if (response.data.status === "Success") {
      const token = crypto.getRandomValues(new Uint8Array(16)).join('');
      localStorage.setItem('authToken', token);

      router.push("/home");
    } else {
      errorMessage.value = "Unerwarteter Fehler. Bitte versuchen Sie es erneut.";
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage.value = "Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre Eingaben.";
      } else {
        errorMessage.value = `Fehler: ${error.response.data.reason}`;
      }
    } else {
      errorMessage.value = "Netzwerkfehler. Bitte versuchen Sie es später erneut.";
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: -10%;
  flex: 1;
}

.login-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
}

form {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-size: 14px;
  color: #636363;
}

input {
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #007bff;
}

button {
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}

.login-info {
  margin-bottom: 3%;
  color: #636363;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}
</style>
