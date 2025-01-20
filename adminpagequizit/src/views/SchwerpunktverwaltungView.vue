<script setup>
import { ref, computed, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useRoute } from 'vue-router';

const route = useRoute();

const fachId = route.query.fachId;
console.log("Schwerpunktverwaltung mit Fach-ID:", fachId);

const schwerpunkte = ref([]);
const searchQuery = ref("");
const defaultIds = [];

if (fachId) {
  defaultIds.push(fachId);
}

const allFocuses = [];

const filteredSchwerpunkte = computed(() => {
  return schwerpunkte.value.filter((schwerpunkt) =>
      schwerpunkt.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const fetchSchwerpunkteVomBackend = async () => {
  try {

    for (const id of defaultIds) {
      const response = await fetch(
          `https://projekte.tgm.ac.at/quizit/api/focus?id=${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: "2e5c9ed5-c5f5-458a-a1cb-40b6235b052a",
            },
          }
      );

      if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      if (data.status === "Success" && data.focuses) {
        allFocuses.push(...data.focuses);
      } else {
        console.warn(`Keine Schwerpunkte für ID ${id} gefunden.`);
      }
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

const createSchwerpunkt = () => {
  const newSchwerpunkt = {
    id: uuidv4(),
    name: "Neuer Schwerpunkt",
    active: 1,
  };
  schwerpunkte.value.push(newSchwerpunkt);
  saveSchwerpunkte();
};

const editSchwerpunkt = (id) => {
  const schwerpunktToEdit = schwerpunkte.value.find(
      (schwerpunkt) => schwerpunkt.id === id
  );
  if (schwerpunktToEdit) {
    console.log("Schwerpunkt zum Bearbeiten:", schwerpunktToEdit);
  }
};

const deleteSchwerpunkt = (id) => {
  schwerpunkte.value = schwerpunkte.value.filter(
      (schwerpunkt) => schwerpunkt.id !== id
  );
  saveSchwerpunkte();
};

const saveSchwerpunkte = () => {
  localStorage.setItem("schwerpunkte", JSON.stringify(schwerpunkte.value));
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

  if (schwerpunkt.active !== (updatedFocus.focusActive === false)) {
    try {
      const response = await fetch('https://projekte.tgm.ac.at/quizit/api/focus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': '2e5c9ed5-c5f5-458a-a1cb-40b6235b052a',
        },
        body: JSON.stringify(updatedFocus),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Fehler beim Aktualisieren des Schwerpunkts: ${errorData.status} - ${errorData.reason}`);
      }

      const data = await response.json();
      console.log('Schwerpunkt erfolgreich aktualisiert:', data);

    } catch (error) {
      console.error('Fehler beim Aktualisieren des Schwerpunkts:', error);
    }
  } else {
    console.log('Kein Update erforderlich, da keine Änderung beim Status vorliegt.');
  }
};


onMounted(() => {
  fetchSchwerpunkteVomBackend();
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
          :class="{ 'inactive': schwerpunkt.active === false }"
      >
        <span class="schwerpunkt-name">{{ schwerpunkt.name }}</span>
        <div class="actions">
          <label>
            Schwerpunkt aktiviert:
            <input
                type="checkbox"
                v-model="schwerpunkt.active"
                @change="updateSchwerpunkt(schwerpunkt)"
            />
          </label>
          <button @click="editSchwerpunkt(schwerpunkt.id)">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button @click="deleteSchwerpunkt(schwerpunkt.id)">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>

    <p v-else>Keine Schwerpunkte gefunden.</p>
  </div>
</template>

<style scoped>
.inactive {
  background-color: #e0e0e0;
  color: #888;
  opacity: 0.5;
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

.schwerpunkt-teachers {
  font-size: 14px;
  color: #666;
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
</style>
