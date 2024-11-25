<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
function tryLogin() {
  router.push("/home");
}
</script>

<template>
  <div class="page-container">
    <h1>Login</h1>
    <p class="login-info">
      Bitte melden Sie sich mit Ihren TGM-Anmeldedaten an!
    </p>
    <div class="login-container">
      <form>
        <label for="email">E-Mail-Adresse</label>
        <input type="email" id="email" name="email" required />

        <label for="password">Passwort</label>
        <input type="password" id="password" name="password" required />

        <button type="submit" @click="tryLogin">Login</button>
      </form>
    </div>
  </div>
</template>

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
</style>
