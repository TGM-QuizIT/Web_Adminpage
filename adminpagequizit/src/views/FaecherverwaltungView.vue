<script setup>
import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";

const router = useRouter();

const faecher = ref([]);
const searchQuery = ref("");

const filteredFaecher = computed(() => {
  return faecher.value.filter((fach) =>
      fach.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const fetchFaecherVomBackend = async () => {
  try {
    const response = await fetch(
        "https://projekte.tgm.ac.at/quizit/api/subject",
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

    console.log("Rückgabe vom Backend:", data);

    if (data.status === "Success" && data.subjects) {
      faecher.value = data.subjects.map((subject) => ({
        id: subject.subjectId,
        name: subject.subjectName,
        active: subject.subjectActive,
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
  const newFach = {
    id: Date.now(),
    name: "Neues Fach",
  };
  faecher.value.push(newFach);
  saveFaecher();
};

const editFach = (id) => {
  const fachToEdit = faecher.value.find((fach) => fach.id === id);
  if (fachToEdit) {
    console.log("Fach zum Bearbeiten:", fachToEdit);
  }
};

const deleteFach = (id) => {
  faecher.value = faecher.value.filter((fach) => fach.id !== id);
  saveFaecher();
};

const saveFaecher = () => {
  localStorage.setItem("faecher", JSON.stringify(faecher.value));
};

const navigateToSchwerpunkte = (fach) => {
  router.push({
    path: '/schwerpunktverwaltung',
    query: { fachId: fach.id }
  });
};

const updateFach = async (fach) => {
  try {
    const response = await fetch("https://projekte.tgm.ac.at/quizit/api/subject", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: "2e5c9ed5-c5f5-458a-a1cb-40b6235b052a",
      },
      body: JSON.stringify({
        subjectId: fach.id,
        subjectActive: fach.active,
        subjectName: fach.subjectName,
        subjectImageAddress: fach.imageAddress,
      }),
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
          <button @click.stop="editFach(fach.id)">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button @click.stop="deleteFach(fach.id)">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>

    <p v-else>Keine Fächer gefunden.</p>
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

</style>
