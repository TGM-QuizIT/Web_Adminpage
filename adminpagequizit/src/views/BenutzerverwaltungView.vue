<template>
  <div class="benutzerverwaltungs-container">
    <h1>Benutzerverwaltung</h1>
    <div class="header">
      <div class="search-container">
        <span class="search-icon material-symbols-outlined">search</span>
        <input
            v-model="searchQuery"
            type="text"
            placeholder="Suchen..."
            class="search-field"
        />
      </div>
    </div>

    <div class="benutzer-liste" v-if="filteredBenutzer.length > 0">
      <div class="benutzer-item" v-for="user in filteredBenutzer" :key="user.id">
        <div class="user-info">
          <span class="user-name">{{ user.fullname }}</span>
          <span class="user-email">Email: {{ user.email }}</span>
          <span class="user-username">Username: {{ user.username }}</span>
          <span class="user-class">Klasse: {{ user.class }}</span>
          <span class="user-year">Jahrgang: {{ user.year }}</span>
          <span class="user-type">Accounttyp: {{ user.type }}</span>
        </div>
        <!--
        <div class="actions">
          <button @click="editUser(user.id)">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button @click="deleteUser(user.id)">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
        -->
      </div>
    </div>

    <p v-else>Keine Benutzer gefunden.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const benutzer = ref([]);
const searchQuery = ref("");

const fetchBenutzerVomBackend = async () => {
  try {
    const response = await fetch(
        "https://projekte.tgm.ac.at/quizit/api/user",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: "2e5c9ed5-c5f5-458a-a1cb-40b6235b052a", // API-Key
          },
        }
    );

    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === "Success" && data.users) {
      benutzer.value = data.users.map((user) => ({
        id: user.userId,
        username: user.userName,
        fullname: user.userFullname || "Unbekannter Name",
        year: user.userYear,
        class: user.userClass,
        type: user.userType,
        email: user.userMail,
      }));
    } else {
      console.error("Keine Benutzer gefunden oder Fehler im Response-Body.");
    }
  } catch (error) {
    console.error("Fehler beim Laden der Benutzer:", error);
  }
};

const filteredBenutzer = computed(() => {
  return benutzer.value.filter((user) => {
    return (
        user.fullname.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });
});

const fetchBenutzer = () => {
  const storedBenutzer = localStorage.getItem("benutzer");

  if (storedBenutzer) {
    benutzer.value = JSON.parse(storedBenutzer);
  } else {
    benutzer.value = [];
  }
};

/*
const editUser = (id) => {
  const userToEdit = benutzer.value.find((user) => user.id === id);
  if (userToEdit) {
    console.log("Benutzer zum Bearbeiten:", userToEdit);
  }
};

const deleteUser = (id) => {
  benutzer.value = benutzer.value.filter((user) => user.id !== id);
  saveBenutzer();
};

const saveBenutzer = () => {
  localStorage.setItem("benutzer", JSON.stringify(benutzer.value));
};
*/

onMounted(() => {
  fetchBenutzer();
  fetchBenutzerVomBackend();
});
</script>

<style scoped>
html,
body {
  height: 100%;
}

.benutzerverwaltungs-container {
  display: flex;
  max-height: 86%;
  flex: 1;
  flex-direction: column;
  margin-top: 1%;
  margin-left: 2%;
  margin-right: 2%;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

button {
  padding: 10px;
  width: 10%;
  background-color: #009de0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
}

button:hover {
  background-color: #007bb5;
  transition: background-color 0.3s;
}

.benutzer-liste {
  height: 70%;
  width: 100%;
  overflow-y: auto;
  margin-top: 20px;
  border-radius: 8px;
  background-color: #f4f3f6;
}

.benutzer-item {
  background-color: #d5d5d5;
  margin: 2%;
  padding: 15px;
  border-radius: 5px;
  box-shadow: -4px 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: bold;
  font-size: 18px;
}

.user-email,
.user-username,
.user-class,
.user-year,
.user-type {
  font-size: 14px;
  color: #666;
}

.actions button {
  margin-left: 10px;
  height: 5%;
  width: auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #888;
  font-size: 20px;
}

.search-field {
  padding-left: 35px;
  padding-right: 10px;
  width: 100%;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
