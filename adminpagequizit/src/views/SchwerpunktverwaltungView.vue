<script setup>
import { ref, computed, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid"; // UUID-Generator

// Lokale Speicherung der Schwerpunkte
const schwerpunkte = ref([]);
const searchQuery = ref("");

// Filtert die Schwerpunkte nach dem Suchbegriff
const filteredSchwerpunkte = computed(() => {
  return schwerpunkte.value.filter((schwerpunkt) =>
      schwerpunkt.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Holt die Schwerpunkte vom Backend
const fetchSchwerpunkteVomBackend = async () => {
  try {
    // Liste von IDs, die standardmäßig verwendet werden
    const defaultIds = [1]; // Füge hier die IDs ein, die standardmäßig geladen werden sollen
    const allFocuses = [];

    // Alle IDs durchlaufen und die Daten abfragen
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

      if (data.status === "Success" && data.focus) {
        allFocuses.push(...data.focus);
      } else {
        console.warn(`Keine Schwerpunkte für ID ${id} gefunden.`);
      }
    }

    // Ergebnisse speichern
    schwerpunkte.value = allFocuses.map((focusObject) => ({
      id: focusObject.focusId,
      name: focusObject.focusName,
    }));

    console.log("Geladene Schwerpunkte:", schwerpunkte.value);
  } catch (error) {
    console.error("Fehler beim Laden der Schwerpunkte:", error);
  }
};

// Erstelle einen neuen Schwerpunkt
const createSchwerpunkt = () => {
  const newSchwerpunkt = {
    id: uuidv4(), // Verwende UUID für die ID
    name: "Neuer Schwerpunkt",
  };
  schwerpunkte.value.push(newSchwerpunkt);
  saveSchwerpunkte();
};

// Bearbeite einen bestehenden Schwerpunkt
const editSchwerpunkt = (id) => {
  const schwerpunktToEdit = schwerpunkte.value.find(
      (schwerpunkt) => schwerpunkt.id === id
  );
  if (schwerpunktToEdit) {
    console.log("Schwerpunkt zum Bearbeiten:", schwerpunktToEdit);
    // Hier könnte man eine Modal oder ein Formular für die Bearbeitung hinzufügen
  }
};

// Lösche einen Schwerpunkt
const deleteSchwerpunkt = (id) => {
  schwerpunkte.value = schwerpunkte.value.filter(
      (schwerpunkt) => schwerpunkt.id !== id
  );
  saveSchwerpunkte();
};

// Speichere die Schwerpunkte lokal
const saveSchwerpunkte = () => {
  localStorage.setItem("schwerpunkte", JSON.stringify(schwerpunkte.value));
};

// Lade die Schwerpunkte, wenn die Komponente gemountet wird
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
      <div class="schwerpunkt-item" v-for="schwerpunkt in filteredSchwerpunkte" :key="schwerpunkt.id">
        <span class="schwerpunkt-name">{{ schwerpunkt.name }}</span>
        <div class="actions">
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
html,
body {
  height: 100%;
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
