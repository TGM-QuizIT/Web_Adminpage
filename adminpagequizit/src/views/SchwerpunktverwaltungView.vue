<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const apiUrl = process.env.VUE_APP_API_URL;
const authKey = process.env.VUE_APP_AUTH_KEY;

let fachId = route.query.fachId;
const selectedFachId = ref(null);
const schwerpunkte = ref([]);
const searchQuery = ref("");
const allFocuses = [];
const allSubjects = ref([]);
const isEditPopupOpen = ref(false);
const currentSchwerpunkt = ref({});
const isFachPopupOpen = ref(false);
const deleteConfirmationOpen = ref(false);
const fachToDelete = ref(null);

const filteredSchwerpunkte = computed(() => {
  if (searchQuery.value.trim() === "") {
    return schwerpunkte.value;
  } else {
    return schwerpunkte.value.filter((schwerpunkt) =>
        schwerpunkt.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
});

import { watch } from "vue";

watch(
    () => currentSchwerpunkt.value.year,
    (newValue) => {
      if (newValue < 1) currentSchwerpunkt.value.year = 1;
      if (newValue > 5) currentSchwerpunkt.value.year = 5;
    }
);

const fetchFaecherVomBackend = async () => {
  try {
    const response = await fetch(
        `${apiUrl}/subject`,
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

    console.log("Rückgabe vom Backend:", data);

    if (data.status === "Success" && data.subjects) {
      allSubjects.value = data.subjects.map((subject) => ({
        id: subject.subjectId,
        name: subject.subjectName,
        active: subject.subjectActive === 1,
        imageAddress: subject.subjectImageAddress,
      }));
    } else {
      console.error("Keine Fächer gefunden oder Fehler im Response-Body.");
    }
  } catch (error) {
    console.error("Fehler beim Laden der Fächer:", error);
  }
};


const fetchSchwerpunkteVomBackend = async () => {
  if (!fachId && selectedFachId.value) {
    fachId = selectedFachId.value;
  }

  try {
    const response = await fetch(
        `${apiUrl}/focus?id=${fachId}`,
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

    if (data.status === "Success" && data.focuses) {
      allFocuses.push(...data.focuses);
    } else {
      console.warn(`Keine Schwerpunkte für Fach-ID ${fachId} gefunden.`);
    }

    schwerpunkte.value = allFocuses.map((focusObject) => ({
      id: focusObject.focusId,
      name: focusObject.focusName,
      year: focusObject.focusYear,
      imageAddress: focusObject.focusImageAddress,
      subjectId: focusObject.subjectId,
      active: focusObject.focusActive === 1,
    }));

    console.log("Geladene Schwerpunkte:", schwerpunkte.value);
  } catch (error) {
    console.error("Fehler beim Laden der Schwerpunkte:", error);
  }
};

const openFachPopup = () => {
  isFachPopupOpen.value = true;
};

const closeFachPopup = () => {
  isFachPopupOpen.value = false;
};

const selectFach = (fachId) => {
  selectedFachId.value = fachId;
  closeFachPopup();
  fetchSchwerpunkteVomBackend();
};

const openEditPopup = (schwerpunkt) => {
  currentSchwerpunkt.value = { ...schwerpunkt };
  popupTitle.value = `Schwerpunkt bearbeiten:\n${schwerpunkt.name}`;
  isEditPopupOpen.value = true;
};

const closeEditPopup = () => {
  isEditPopupOpen.value = false;
};

const saveEditPopup = async () => {

  try {
    const response = await fetch(`${apiUrl}/focus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": `${authKey}`,
      },
      body: JSON.stringify({
        focusName: currentSchwerpunkt.value.name,
        focusYear: currentSchwerpunkt.value.year,
        focusImageAddress: currentSchwerpunkt.value.imageAddress,
        subjectId: parseInt(fachId.valueOf(), 10),
      }),
    });

    if (!response.ok) {
      throw new Error(`Fehler: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (data.status === "Success" && data.focus) {
      schwerpunkte.value.push({
        id: data.focus.focusId,
        name: data.focus.focusName,
        year: data.focus.focusYear,
        imageAddress: data.focus.focusImageAddress,
        subjectId: data.focus.subjectId,
        active: data.focus.focusActive ? 1 : 0,
      });
    }
  } catch (error) {
    console.error("Fehler beim Erstellen des Schwerpunkts:", error);
  }

  closeEditPopup();
};

const popupTitle = ref("Schwerpunkt erstellen");

const createSchwerpunkt = () => {
  currentSchwerpunkt.value = {
    id: null,
    name: "",
    year: null,
    imageAddress: null,
    subjectId: null,
    active: 1,
  };
  popupTitle.value = "Schwerpunkt erstellen";
  isEditPopupOpen.value = true;
};

const updateSchwerpunkt = async (schwerpunkt) => {
  const updatedFocus = {
    focusId: schwerpunkt.id,
    focusName: schwerpunkt.name,
    focusYear: schwerpunkt.year,
    focusImageAddress: schwerpunkt.imageAddress,
    subjectId: schwerpunkt.subjectId,
    focusActive: schwerpunkt.active,
  };

  try {
    const response = await fetch(
        `${apiUrl}/focus`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${authKey}`,
          },
          body: JSON.stringify(updatedFocus),
        }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
          `Fehler beim Aktualisieren des Schwerpunkts: ${errorData.status} - ${errorData.reason}`
      );
    }

    const data = await response.json();
    console.log("Schwerpunkt erfolgreich aktualisiert:", data);
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Schwerpunkts:", error);
  }
};

const navigateToFragen = (schwerpunkt) => {
  router.push({
    path: "/fragenverwaltung",
    query: { schwerpunktId: schwerpunkt.id },
  });
};

const confirmDelete = (fachId) => {
  fachToDelete.value = fachId;
  deleteConfirmationOpen.value = true;
};

onMounted(() => {
  if (route.query.fachId) {
    fachId = route.query.fachId;
    selectedFachId.value = fachId;
  }


  console.log(fachId)

  fetchFaecherVomBackend();

  if (!fachId) {
    openFachPopup();
  } else {
    fetchSchwerpunkteVomBackend();
  }
});

</script>

<template>
  <div class="schwerpunkteverwaltungs-container">
    <h1>Schwerpunktverwaltung</h1>
    <div class="header">
      <button @click="createSchwerpunkt" class="schwerpunkt-create-button">
        <span class="material-symbols-outlined">post_add</span>Schwerpunkt erstellen
      </button>
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

    <div class="schwerpunkt-liste" v-if="filteredSchwerpunkte.length > 0">
      <div
          class="schwerpunkt-item"
          v-for="schwerpunkt in filteredSchwerpunkte"
          :key="schwerpunkt.id"
          @click="navigateToFragen(schwerpunkt)"
          :class="{ inactive: schwerpunkt.active === false }"
      >
        <span class="schwerpunkt-name">{{ schwerpunkt.name }}</span>
        <div class="actions">
          <label>
            Schwerpunkt aktiviert:
            <input
                type="checkbox"
                v-model="schwerpunkt.active"
                @change="updateSchwerpunkt(schwerpunkt)"
                @click.stop
            />
          </label>
          <button @click.stop="openEditPopup(schwerpunkt)">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button @click.stop="confirmDelete(schwerpunkt.id)">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>

    <p v-else>Keine Schwerpunkte gefunden.</p>

    <div v-if="isFachPopupOpen" class="fach-popup-overlay">
      <div class="fach-popup">
        <h2>Bitte Fach auswählen</h2>
        <div v-for="fach in allSubjects" :key="fach.id">
          <button class="subjectSelectButton" @click="selectFach(fach.id)">{{ fach.name }}</button>
        </div>
      </div>
    </div>

    <div v-if="deleteConfirmationOpen" class="confirmation-popup">
      <div class="confirmation-box">
        <p>Fach löschen?</p>
        <button @click="deleteFach">Yes</button>
        <button @click="deleteConfirmationOpen = false">No</button>
      </div>
    </div>

    <div v-if="isEditPopupOpen" class="edit-popup-overlay">
      <div class="edit-popup">
        <button class="close-button" @click="closeEditPopup">X</button>
        <h2>{{ popupTitle }}</h2>
        <label for="name">Name:</label>
        <input id="name" v-model="currentSchwerpunkt.name" type="text" />

        <label for="year">Jahr:</label>
        <input id="year" v-model="currentSchwerpunkt.year" type="number" min="1" max="5" />

        <label for="imageAddress">Bild-URL:</label>
        <input
            id="imageAddress"
            v-model="currentSchwerpunkt.imageAddress"
            type="text"
        />

        <button @click="saveEditPopup" class="save-button">Speichern</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inactive {
  background-color: #e0e0e0;
  color: #888;
  opacity: 0.5;
}

.subjectSelectButton {
  width: 100%;
}

.fach-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.fach-popup {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.fach-popup button {
  padding: 10px;
  background-color: #009de0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
  font-size: 16px;
}

.fach-popup button:hover {
  background-color: #007bb5;
  transition: background-color 0.3s;
}

.fach-popup h2 {
  color: #000;
  font-size: 20px;
  margin-bottom: 10px;
}

.schwerpunkteverwaltungs-container {
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

.schwerpunkt-liste {
  height: 70%;
  width: 100%;
  overflow-y: auto;
  margin-top: 20px;
  border-radius: 8px;
  background-color: #f4f3f6;
}

.schwerpunkt-item {
  background-color: #d5d5d5;
  margin: 2%;
  padding: 15px;
  border-radius: 5px;
  box-shadow: -4px 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schwerpunkt-name {
  font-weight: bold;
  font-size: 18px;
}

.actions button {
  margin-left: 10px;
  height: 5%;
  width: auto;
}

.schwerpunkt-create-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 12%;
  font-size: 20px;
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

.edit-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edit-popup {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  width: 500px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.edit-popup input {
  width: 100%;
  max-width: calc(100% - 40px);
  padding: 12px;
  margin-top: 5px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  background-color: #fff;
  transition: all 0.3s ease;
  outline: none;
}

.edit-popup input:focus {
  border-color: #009de0;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 157, 224, 0.5);
}

.close-button {
  background: #009de0;
  border: none;
  font-size: 20px;
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  padding: 5px 10px;
}

.edit-popup label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
  font-size: 16px;
  color: #000000;
}

.edit-popup h2 {
  margin-top: 0;
  color: #000000;
  font-size: 22px;
}

button.save-button {
  margin-top: 3%;
  padding: 10px 20px;
  background-color: #009de0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: bold;
  display: inline-block;
  width: auto;
}

button.save-button:hover {
  background-color: #007bb5;
}

button.save-button:focus {
  outline: none;
}

button.save-button:active {
  background-color: #005f84;
}

.schwerpunkt-item:hover {
  background-color: #cccccc;
}

.actions {
  display: flex;
  align-items: center;
}

.edit-popup h2 {
  white-space: pre-line;
}
</style>
