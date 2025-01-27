<script setup>
import { ref, computed, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useRoute } from "vue-router";

const route = useRoute();

const schwerpunktId = route.query.schwerpunktId;

const fragen = ref([]);
const searchQuery = ref("");
const allQuestions = [];

const filteredFragen = computed(() => {
  return fragen.value.filter((frage) =>
      frage.text.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const isEditPopupOpen = ref(false);
const currentFrage = ref({});

const fetchFragenVomBackend = async () => {
  try {
    const url = new URL("https://projekte.tgm.ac.at/quizit/api/question/focus");
    url.searchParams.append("id", schwerpunktId);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: "2e5c9ed5-c5f5-458a-a1cb-40b6235b052a",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === "Success" && data.questions) {
      allQuestions.push(...data.questions);
    } else {
      console.warn("Keine Fragen gefunden.");
    }


    fragen.value = allQuestions.map((question) => ({
      id: question.questionId,
      text: question.questionText,
      options: question.options,
      selectedCorrectAnswer: question.options.findIndex(option => option.optionCorrect),
      focusId: question.focusId,
      mChoice: question.mChoice,
      textInput: question.textInput,
      imageAddress: question.imageAddress,
      active: true,
    }));

    console.log("Geladene Fragen:", fragen.value);
  } catch (error) {
    console.error("Fehler beim Laden der Fragen:", error);
  }
};

const openEditPopup = (frage) => {
  currentFrage.value = { ...frage };
  isEditPopupOpen.value = true;
};

const closeEditPopup = () => {
  isEditPopupOpen.value = false;
};

const saveEditPopup = () => {
  const index = fragen.value.findIndex((q) => q.id === currentFrage.value.id);
  if (index !== -1) {
    fragen.value[index] = { ...currentFrage.value };
    updateFrage(currentFrage.value);
  }
  closeEditPopup();
};

const createFrage = () => {
  const newFrage = {
    id: uuidv4(),
    text: "Neue Frage",
    active: true,
    options: [],
    correctAnswer: null,
  };
  fragen.value.push(newFrage);
  saveFragen();
};

const deleteFrage = (id) => {
  fragen.value = fragen.value.filter((frage) => frage.id !== id);
  saveFragen();
};

const updateFrage = async (frage) => {
  const updatedQuestion = {
    questionId: frage.id,
    questionText: frage.text,
    options: frage.options,
    correctAnswer: frage.correctAnswer,
    focusId: frage.focusId,
    mChoice: frage.mChoice,
    textInput: frage.textInput,
    imageAddress: frage.imageAddress,
    active: frage.active,
  };

  try {
    const response = await fetch(
        "https://projekte.tgm.ac.at/quizit/api/question/subject",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "2e5c9ed5-c5f5-458a-a1cb-40b6235b052a",
          },
          body: JSON.stringify(updatedQuestion),
        }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
          `Fehler beim Aktualisieren der Frage: ${errorData.status} - ${errorData.reason}`
      );
    }

    const data = await response.json();
    console.log("Frage erfolgreich aktualisiert:", data);
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Frage:", error);
  }
};

const saveFragen = () => {
  localStorage.setItem("fragen", JSON.stringify(fragen.value));
};

onMounted(() => {
  fetchFragenVomBackend();
});
</script>

<template>
  <div class="fragenverwaltungs-container">
    <h1>Fragenverwaltung</h1>
    <div class="header">
      <button @click="createFrage" class="frage-create-button">
        <span class="material-symbols-outlined">post_add</span>Frage erstellen
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

    <div class="fragen-liste" v-if="filteredFragen.length > 0">
      <div
          class="frage-item"
          v-for="frage in filteredFragen"
          :key="frage.id"
          :class="{ inactive: frage.active === false }"
      >
        <span class="frage-name">{{ frage.text }}</span>
        <div class="actions">
          <label>
            Frage aktiviert:
            <input
                type="checkbox"
                v-model="frage.active"
                @change="updateFrage(frage)"
            />
          </label>
          <button @click="openEditPopup(frage)">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button @click="deleteFrage(frage.id)">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>

    <p v-else>Keine Fragen gefunden.</p>

    <div v-if="isEditPopupOpen" class="edit-popup-overlay">
      <div class="edit-popup">
        <button class="close-button" @click="closeEditPopup">X</button>
        <h2>Frage bearbeiten</h2>
        <div class="popup-content">
          <div class="left-side">
            <label for="text" class="labelText">Fragetext:</label>
            <div class="left-side-upper">
              <textarea id="text" v-model="currentFrage.text"/>
            </div>
          </div>

          <div class="right-side">
            <div class="answers-list-labels">
              <label for="options">Antwort</label>
              <label for="options">Korrekt</label>
            </div>

            <div class="answers-list">
              <div
                  v-for="(option, index) in currentFrage.options"
                  :key="index"
                  class="option"
              >
                <input
                    class="answers-list-textinput"
                    v-model="option.optionText"
                    type="text"
                    :placeholder="'Antwort ' + (index + 1)"
                />
                <button class="deleteAnswerButton" @click="currentFrage.options.splice(index,1)">X</button>
                <label>
                  <input
                      type="radio"
                      v-model="currentFrage.selectedCorrectAnswer"
                      :value="index"
                  />
                </label>

              </div>
              <button class="addAnswerButton" @click="currentFrage.options.push('')">Antwort hinzufügen</button>
            </div>
          </div>
        </div>

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

.fragenverwaltungs-container {
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

.deleteAnswerButton {
  background-color: #ff4c4c;
  color: white;
  border-radius: 5px;
  padding: 5px 10px;
  margin-top: 5px;
}

.deleteAnswerButton:hover {
  background-color: #ff2e2e;
  transition: background-color 0.3s;
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

.fragen-liste {
  height: 70%;
  width: 100%;
  overflow-y: auto;
  margin-top: 20px;
  border-radius: 8px;
  background-color: #f4f3f6;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.frage-item {
  background-color: #d5d5d5;
  margin: 2%;
  padding: 15px;
  border-radius: 5px;
  box-shadow: -4px 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.frage-name {
  font-weight: bold;
  font-size: 18px;
}

.actions button {
  margin-left: 10px;
  height: 5%;
  width: auto;
}

.frage-create-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 12%;
  font-size: 20px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-field {
  padding-left: 35px;
  padding-right: 10px;
  width: 100%;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #888;
  font-size: 20px;
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
  width: 80%;
  height: 80%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.popup-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.left-side {
  width: 38%;
  height: 80%;
  display: flex;
  flex-direction: column;
}

.left-side-upper {
  margin-bottom: 2%;
  display: flex;
  align-items: center;
}

.labelText {
  font-weight: bold;
}

.right-side {
  width: 58%;
  display: flex;
  flex-direction: column;
}

.left-side textarea {
  width: 90%;
  padding-bottom: 20%;
  margin-top: 2%;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 12px;
  background-color: #fff;
  transition: all 0.3s ease;
  outline: none;
  resize: none;
}

.left-side textarea:focus {
  border-color: #009de0;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 157, 224, 0.5);
}

.left-side input:focus {
  border-color: #009de0;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 157, 224, 0.5);
}

.answers-list {
  max-height: 80%;
  overflow-y: auto;
}

.answers-list .option {
  margin-bottom: 4%;
}

.save-button {
  padding: 10px 30px;
  background-color: #4caf50;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  align-self: flex-end;
}

.save-button:hover {
  background-color: #45a049;
  transition: background-color 0.3s;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  color: #009de0;
  font-size: 20px;
  cursor: pointer;
}

.addAnswerButton {
  padding: 10px;
  width: auto;
  background-color: #009de0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
}

.addAnswerButton:hover {
  background-color: #007bb5;
  transition: background-color 0.3s;
}

.option {
  margin-bottom: 20%;
  display: flex;
  align-items: center;
  gap: 6%;
}

.answers-list-labels {
  display: flex;
  gap: 60.5%;
  margin-bottom: 2%;
  font-weight: bold;
}

.answers-list-textinput {
  width: 50%;
  padding-bottom: 4%;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 12px;
  background-color: #fff;
  transition: all 0.3s ease;
  outline: none;
  resize: none;
}

.answers-list-textinput:focus {
  border-color: #009de0;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 157, 224, 0.5);
}
</style>
