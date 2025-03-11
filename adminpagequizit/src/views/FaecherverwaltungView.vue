<script setup>
import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";

const apiUrl = process.env.VUE_APP_API_URL;
const authKey = process.env.VUE_APP_AUTH_KEY;

const router = useRouter();

const isEditPopupOpen = ref(false);
const faecher = ref([]);
const searchQuery = ref("");
const currentFach = ref({ id: null, name: "", active: 1, imageAddress: "" });
const deleteConfirmationOpen = ref(false);
const fachToDelete = ref(null);

const filteredFaecher = computed(() => {
  return faecher.value.filter((fach) =>
      fach.name && fach.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const closeEditPopup = () => {
  isEditPopupOpen.value = false;
};

const saveEditPopup = async () => {
  if (!currentFach.value.name.trim()) {
    alert("Bitte einen Namen für das Fach eingeben.");
    return;
  }

  if (currentFach.value.id) {
    const index = faecher.value.findIndex(
        (f) => f.id === currentFach.value.id
    );
    if (index !== -1) {
      faecher.value[index] = { ...currentFach.value };
      await updateFach(currentFach.value);
    }
  } else {
    // Create new Fach
    const newSubject = {
      subjectName: currentFach.value.name,
      subjectImageAddress: currentFach.value.imageAddress || "https://www.google.com"
    };

    try {
      const response = await fetch(`${apiUrl}/subject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `${authKey}`,
        },
        body: JSON.stringify(newSubject),
      });

      if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fach erfolgreich erstellt:", data);

      if (data.status === "Success") {
        faecher.value.push({
          id: data.subject.subjectId,
          name: data.subject.subjectName,
          active: data.subject.subjectActive === 1,
          imageAddress: data.subject.subjectImageAddress,
        });
      }
    } catch (error) {
      console.error("Fehler beim Erstellen des Fachs:", error);
    }
  }
  closeEditPopup();
};

const fetchFaecherVomBackend = async () =>  {
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
      faecher.value = data.subjects.map((subject) => ({
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

const createSubject = () => {
  currentFach.value = {
    id: null,
    name: "",
    active: 1,
    imageAddress: "",
  };
  isEditPopupOpen.value = true;
};

const deleteFach = async () => {
  try {
    const response = await fetch(`https://projekte.tgm.ac.at/quizit/api/subject?id=${fachToDelete.value}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `${authKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Löschen des Fachs! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "Success") {
      faecher.value = faecher.value.filter((fach) => fach.id !== fachToDelete.value);
      console.log("Fach erfolgreich gelöscht:", fachToDelete.value);
      fachToDelete.value = null;
    } else {
      console.error("Fehler beim Löschen des Fachs:", data);
    }
  } catch (error) {
    console.error("Fehler beim Löschen des Fachs:", error);
  } finally {
    deleteConfirmationOpen.value = false;
  }
};

const navigateToSchwerpunkte = (fach) => {
  router.push({
    path: '/schwerpunktverwaltung',
    query: { fachId: fach.id }
  });
};

const updateFach = async (fach) => {
  const updatedSubject = {
    subjectId: fach.id,
    subjectActive: fach.active,
    subjectName: fach.name,
    subjectImageAddress: fach.imageAddress,
  };

  try {
    const response = await fetch(`${apiUrl}/subject`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `${authKey}`,
      },
      body: JSON.stringify(updatedSubject),
    });

    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }

    const data = await response.json();

    console.log("Rückgabe vom Backend:", data);

    if (data.status === "Success") {
      console.log("Fach erfolgreich aktualisiert:", data.subject);
    } else {
      console.error("Fehler beim Aktualisieren des Fachs:", data);
    }
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Fachs:", error);
  }
};

const editFach = (fach) => {
  currentFach.value = { ...fach };
  isEditPopupOpen.value = true;
};

const confirmDelete = (fachId) => {
  fachToDelete.value = fachId;
  deleteConfirmationOpen.value = true;
};

onMounted(() => {
  fetchFaecherVomBackend();
});
</script>

<template>
  <div class="faecherverwaltungs-container">
    <h1>Fächerverwaltung</h1>
    <div class="header">
      <button @click="createSubject" class="fach-create-button">
        <span class="material-symbols-outlined">post_add</span>Fach erstellen
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

    <div class="fach-liste" v-if="filteredFaecher.length > 0">
      <div
          class="fach-item"
          v-for="fach in filteredFaecher"
          :key="fach.id"
          @click="navigateToSchwerpunkte(fach)"
          :class="{ inactive: fach.active === false}"
      >
        <span class="fach-name">{{ fach.name }}</span>
        <div class="actions">
          <label>
            Fach aktiviert:
            <input
                type="checkbox"
                v-model="fach.active"
                @change="updateFach(fach)"
                @click.stop
            />
          </label>

          <button @click.stop="editFach(fach)">
            <span class="material-symbols-outlined">edit</span>
          </button>

          <button @click.stop="confirmDelete(fach.id)">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>

    <p v-else>Keine Fächer gefunden.</p>

    <div v-if="deleteConfirmationOpen" class="confirmation-popup">
      <div class="confirmation-box">
        <p>Fach löschen?</p>
        <button @click="deleteFach">Ja</button>
        <button @click="deleteConfirmationOpen = false">Nein</button>
      </div>
    </div>

    <div v-if="isEditPopupOpen" class="edit-popup-overlay">
      <div class="edit-popup">
        <button class="close-button" @click="closeEditPopup">X</button>

        <h2>{{ currentFach.id ? `Fach bearbeiten: ${currentFach.name}` : 'Fach erstellen' }}</h2>

        <div v-if="!currentFach.id">
          <label for="name">Name:</label>
          <input id="name" v-model="currentFach.name" type="text" />
        </div>

        <div v-if="currentFach.id">
          <label for="image">Bild-Link:</label>
          <input id="image" v-model="currentFach.imageAddress" type="text" />
        </div>

        <button @click="saveEditPopup" class="save-button">Speichern</button>
      </div>
    </div>



  </div>
</template>

<style scoped>
html,
body {
  height: 100%;
}

.inactive {
  background-color: #e0e0e0;
  color: #888;
  opacity: 0.5;
}

.faecherverwaltungs-container {
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

.fach-liste {
  height: 70%;
  width: 100%;
  overflow-y: auto;
  margin-top: 20px;
  border-radius: 8px;
  background-color: #f4f3f6;
}

.fach-item {
  background-color: #d5d5d5;
  margin: 2%;
  padding: 15px;
  border-radius: 5px;
  box-shadow: -4px 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.fach-item:hover {
  background-color: #cccccc;
}

.fach-name {
  font-weight: bold;
  font-size: 18px;
}

.actions button {
  margin-left: 10px;
  height: 5%;
  width: auto;
}

.fach-create-button {
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

.actions {
  display: flex;
  align-items: center;
}
.edit-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
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

.edit-popup h2 {
  margin-top: 0;
  color: #000000;
  font-size: 22px;
}

.edit-popup label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
  font-size: 16px;
  color: #000000;
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

button.close-button:hover {
  background-color: #007bb5;
  transition: background-color 0.3s;
}

button.save-button:active {
  background-color: #005f84;
}

button.close-button {
  background: #009de0;
  border: none;
  font-size: 20px;
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  padding: 5px 10px;
}

.confirmation-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirmation-box {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.confirmation-box p {
  margin-bottom: 20px;
  font-size: 16px;
}

.confirmation-box button {
  padding: 10px 20px;
  margin-top: 10px;
  cursor: pointer;
  background-color: #009de0;
  color: white;
  border: none;
  border-radius: 4px;
  width: 100%;
}

.confirmation-box button:hover {
  background-color: #0092e0;
}

.confirmation-box button:nth-child(2) {
  background-color: #f44336;
}

.confirmation-box button:nth-child(2):hover {
  background-color: #e53935;
}


</style>
