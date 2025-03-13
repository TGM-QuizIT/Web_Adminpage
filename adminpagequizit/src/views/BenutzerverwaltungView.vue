<script setup>
import { ref, computed, onMounted } from "vue";

const benutzer = ref([]);
const searchQuery = ref("");
const selectedClass = ref(null);
const apiUrl = process.env.VUE_APP_API_URL;
const authKey = process.env.VUE_APP_AUTH_KEY;

const fetchBenutzerVomBackend = async () => {
  try {
    const response = await fetch(
        `${apiUrl}/user`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `${authKey}`,
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
        blocked: user.userBlocked || false,
      }));
    } else {
      console.error("Keine Benutzer gefunden oder Fehler im Response-Body.");
    }
  } catch (error) {
    console.error("Fehler beim Laden der Benutzer:", error);
  }
};

const filteredBenutzer = computed(() => {
  const searchTerms = searchQuery.value.toLowerCase().split(" ");

  return benutzer.value.filter((user) => {
    const matchesSearchQuery = searchTerms.every(term =>
        user.fullname.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.class.toLowerCase().includes(term) ||
        user.year.toString().includes(term) ||
        user.type.toLowerCase().includes(term)
    );

    const matchesSelectedClass = selectedClass.value ? user.class === selectedClass.value : true;

    return matchesSearchQuery && matchesSelectedClass;
  });
});

const toggleBlockUser = async (user) => {
  try {
    const response = await fetch(
        `${apiUrl}/user/block`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `${authKey}`,
          },
          body: JSON.stringify({
            userId: user.id,
            userBlocked: !user.blocked,
          }),
        }
    );

    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === "Success" && data.user) {
      user.blocked = !user.blocked;
    } else {
      console.error("Fehler bei der Sperrung/Entsperrung des Benutzers.");
    }
  } catch (error) {
    console.error("Fehler beim Sperren/Entsperren des Benutzers:", error);
  }
};

const updateUserYear = async (user, newYear) => {
  try {
    const response = await fetch(
        `${apiUrl}/user`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `${authKey}`,
          },
          body: JSON.stringify({
            userId: user.id,
            userYear: newYear,
          }),
        }
    );

    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === "Success" && data.user) {
      user.year = newYear; // Aktualisiere den Jahrgang lokal
    } else {
      console.error("Fehler beim Aktualisieren des Jahrgangs.");
    }
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Jahrgangs:", error);
  }
};

onMounted(() => {
  fetchBenutzerVomBackend();
});
</script>

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
      <select v-model="selectedClass" class="class-dropdown">
        <option :value="null">Alle Klassen</option>
        <option v-for="cls in [...new Set(benutzer.map(user => user.class))]" :key="cls" :value="cls">
          {{ cls }}
        </option>
      </select>
    </div>

    <div class="benutzer-liste" v-if="filteredBenutzer.length > 0">
      <div class="benutzer-item" v-for="user in filteredBenutzer" :key="user.id" :class="{ blocked: user.blocked }">
        <div class="user-info">
          <span class="user-name">{{ user.fullname }}</span>
          <span class="user-email">Email: {{ user.email }}</span>
          <span class="user-username">Username: {{ user.username }}</span>
          <span class="user-class">Klasse: {{ user.class }}</span>
          <span class="user-year">
            Jahrgang:
            <input
                type="number"
                v-model.number="user.year"
                min="1"
                max="5"
                @change="updateUserYear(user, user.year)"
                class="year-input"
            />
          </span>
          <span class="user-type">Accounttyp: {{ user.type }}</span>
        </div>
        <div class="actions">
          <button @click="toggleBlockUser(user)" :class="{ blocked: user.blocked }">
            {{ user.blocked ? 'Entsperren' : 'Sperren' }}
          </button>
        </div>
      </div>
    </div>

    <p v-else>Keine Benutzer gefunden.</p>
  </div>
</template>

<style scoped>
html,
body {
  height: 100%;
}

.year-input {
  width: 60px;
  padding: 8px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background-color: #f9f9f9;
  color: #333;
}

.year-input:hover {
  border-color: #009de0;
}

.year-input:focus {
  border-color: #009de0;
  box-shadow: 0 0 8px rgba(0, 157, 224, 0.5);
  background-color: #fff;
}

.user-year {
  display: flex;
  align-items: center;
  margin-top: 2%;
  margin-bottom: 2%;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.benutzerverwaltungs-container {
  display: flex;
  max-height: 85%;
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
  width: auto;
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

button.blocked {
  background-color: red;
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

.benutzer-item.blocked {
  background-color: #f7d7d7;
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
  flex-grow: 1;
  margin-right: 10px;
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
  border: 2px solid #ccc;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background-color: #f9f9f9;
  color: #333;
}

.search-field:hover {
  border-color: #009de0;
}

.search-field:focus {
  border-color: #009de0;
  box-shadow: 0 0 8px rgba(0, 157, 224, 0.5);
  background-color: #fff;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #888;
  font-size: 20px;
  transition: color 0.3s ease;
}

.search-container:hover .search-icon {
  color: #009de0;
}

.search-field:focus + .search-icon {
  color: #009de0;
}

.class-dropdown {
  padding: 10px;
  font-size: 16px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  color: #333;
  cursor: pointer;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.class-dropdown:hover {
  border-color: #009de0;
}

.class-dropdown:focus {
  border-color: #009de0;
  box-shadow: 0 0 8px rgba(0, 157, 224, 0.5);
  background-color: #fff;
}

.class-dropdown option {
  padding: 10px;
  background-color: #fff;
  color: #333;
}

.class-dropdown option:hover {
  background-color: #009de0;
  color: #fff;
}


.year-input {
  width: 50px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
}
</style>