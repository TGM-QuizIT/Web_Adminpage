<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
const apiUrl = process.env.VUE_APP_API_URL;
const authKey = process.env.VUE_APP_AUTH_KEY;

const route = useRoute();
const router = useRouter();
const schwerpunktId = route.query.schwerpunktId;
const fachId = route.query.fachId;

const fragen = ref([]);
const searchQuery = ref("");
const allQuestions = [];

const selectedType = ref("single");
const isEditPopupOpen = ref(false);
const currentFrage = ref({});

const fachToDelete = ref(null);
const deleteConfirmationOpen = ref(false);

const goBack = () => {
  router.push({
    path: "/schwerpunktverwaltung",
    query: { fachId: fachId, schwerpunktId: schwerpunktId },
  });
};

const onTypeChange = () => {
  if (selectedType.value === "single") {
    const firstCorrectIndex = currentFrage.value.options.findIndex(
        (option) => option.optionCorrect
    );
    currentFrage.value.selectedCorrectAnswer =
        firstCorrectIndex !== -1 ? firstCorrectIndex : null;

    currentFrage.value.options.forEach((option) => {
      option.optionCorrect = false;
    });
  } else if (selectedType.value === "multiple") {
    currentFrage.value.selectedCorrectAnswer = [];
    currentFrage.value.options.forEach((option) => {
      option.optionCorrect = false;
    });
  } else if (selectedType.value === "text") {
    currentFrage.value.selectedCorrectAnswer = null;
  }
};

const filteredFragen = computed(() => {
  return fragen.value.filter((frage) => frage.text && frage.text.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const saveEditPopup = async () => {
  if (!validateAnswers()) {
    return;
  }

  const questionData = {
    questionText: currentFrage.value.text,
    options: currentFrage.value.options.map(option => ({
      optionText: option.optionText,
      optionCorrect: option.optionCorrect,
    })),
    focusId: parseInt(schwerpunktId.valueOf(), 10),
    mChoice: selectedType.value === "multiple",
    textInput: selectedType.value === "text",
    imageAddress: currentFrage.value.imageAddress || "https://www.google.com/image.jpeg",
  };

  try {
    const url = currentFrage.value.id
        ? `${apiUrl}/question/${currentFrage.value.id}`
        : `${apiUrl}/question?focusId=${schwerpunktId}`;

    const method = currentFrage.value.id ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        authorization: `${authKey}`,
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Speichern der Frage. Status: ${response.status}`);
    }

    const responseData = await response.json();

    if (responseData.status === "Success") {
      if (!currentFrage.value.id) {
        fragen.value.unshift(responseData.question);
      } else {
        const index = fragen.value.findIndex((q) => q.id === currentFrage.value.id);
        if (index !== -1) {
          fragen.value[index] = responseData.question;
        }
      }

      allQuestions.length = 0;

      await fetchFragenVomBackend();
      closeEditPopup();
    } else {
      alert("Fehler beim Speichern der Frage.");
    }
  } catch (error) {
    console.error("Fehler beim Speichern der Frage:", error);
    alert("Es gab einen Fehler beim Speichern der Frage.");
  }
};

const fetchFragenVomBackend = async () => {
  try {
    const url = new URL(`${apiUrl}/question/focus`);
    url.searchParams.append("id", schwerpunktId);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `${authKey}`,
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
    }));

    console.log("Geladene Fragen:", fragen.value);
  } catch (error) {
    console.error("Fehler beim Laden der Fragen:", error);
  }
};

const openEditPopup = (frage) => {
  currentFrage.value = { ...frage };

  if (frage.mChoice) {
    selectedType.value = "multiple";
  } else if (frage.textInput) {
    selectedType.value = "text";
  } else {
    selectedType.value = "single";
  }

  isEditPopupOpen.value = true;
};


const openCreatePopup = () => {
  currentFrage.value = {
    text: "",
    options: [
      { optionText: '', optionCorrect: false },
      { optionText: '', optionCorrect: false },
      { optionText: '', optionCorrect: false },
      { optionText: '', optionCorrect: false }
    ],
    selectedCorrectAnswer: null
  };
  isEditPopupOpen.value = true;
};


const closeEditPopup = () => {
  isEditPopupOpen.value = false;
};

const confirmDelete = (frageId) => {
  fachToDelete.value = frageId;
  deleteConfirmationOpen.value = true;
};

const deleteQuestion = async () => {
  try {
    const response = await fetch(`${apiUrl}/question?id=${fachToDelete.value}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `${authKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Fehler beim Löschen der Frage. Status: ${response.status}`);
    }

    const responseData = await response.json();

    if (responseData.status === "Success") {
      fragen.value = fragen.value.filter((frage) => frage.id !== fachToDelete.value);
      deleteConfirmationOpen.value = false;
    } else {
      alert("Fehler beim Löschen der Frage.");
    }
  } catch (error) {
    console.error("Fehler beim Löschen der Frage:", error);
    alert("Es gab einen Fehler beim Löschen der Frage.");
  }
};

const validateAnswers = () => {
  if (selectedType.value === "single") {
    if (currentFrage.value.selectedCorrectAnswer === null) {
      alert("Bitte wählen Sie eine korrekte Antwort aus.");
      return false;
    }
  } else if (selectedType.value === "multiple") {
    const correctAnswersCount = currentFrage.value.options.filter(option => option.optionCorrect).length;
    if (correctAnswersCount < 2) {
      alert("Bitte wählen Sie mindestens zwei korrekte Antworten aus.");
      return false;
    }
  }

  return true;
};

const addAnswer = () => {
  currentFrage.value.options.push({ optionText: '', optionCorrect: false });
};

onMounted(() => {
  fetchFragenVomBackend();
});
</script>

<template>
  <div class="fragenverwaltungs-container">
    <h1>Fragenverwaltung</h1>
    <div class="header">
      <button @click="openCreatePopup" class="frage-create-button">
        <span class="material-symbols-outlined">post_add</span>Frage erstellen
      </button>
      <button @click="goBack" class="back-button">
        <span class="material-symbols-outlined">arrow_back</span> Zur Schwerpunktverwaltung
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
      >
        <span class="frage-name">{{ frage.text }}</span>
        <div class="actions">
          <button @click="openEditPopup(frage)">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button @click="confirmDelete(frage.id)">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>

    <p v-else>Keine Fragen gefunden.</p>

    <div v-if="deleteConfirmationOpen" class="confirmation-popup">
      <div class="confirmation-box">
        <p>Frage löschen?</p>
        <button @click="deleteQuestion">Ja</button>
        <button @click="deleteConfirmationOpen = false">Nein</button>
      </div>
    </div>


    <div v-if="isEditPopupOpen" class="edit-popup-overlay">
      <div class="edit-popup">
        <button class="close-button" @click="closeEditPopup">X</button>
        <h2>{{ currentFrage.id ? 'Frage bearbeiten' : 'Frage erstellen' }}</h2>
        <div class="popup-content">
          <div class="left-side">
            <label for="text" class="labelText">Fragetext:</label>
            <textarea id="text" v-model="currentFrage.text" maxlength="255" />
            <label for="question-type" class="labelText">Fragetyp:</label>
            <select
                id="question-type"
                v-model="selectedType"
                class="dropdown"
                @change="onTypeChange"
            >
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
              <option value="text">Texteingabe</option>
            </select>
          </div>

          <div class="right-side" v-if="selectedType !== 'text'">
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
                    maxlength="50"
                    type="text"
                    :placeholder="'Antwort ' + (index + 1)"
                />
                <button class="deleteAnswerButton" @click="currentFrage.options.splice(index, 1)">X</button>
                <label>
                  <input
                      v-if="selectedType === 'single'"
                      type="radio"
                      :name="'single-choice-' + currentFrage.id"
                      :value="index"
                      v-model="currentFrage.selectedCorrectAnswer"
                  />
                  <input
                      v-else
                      type="checkbox"
                      v-model="option.optionCorrect"
                  />
                </label>
              </div>
              <button class="addAnswerButton" @click="addAnswer">Antwort hinzufügen</button>
            </div>
          </div>
        </div>

        <button @click="saveEditPopup" class="save-button">Speichern</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.back-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: auto;
  font-size: 16px;
  background-color: #6c757d;
  margin-right: 50%;
}

.back-button:hover {
  background-color: #5a6268;
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
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.deleteAnswerButton:hover {
  background-color: #ff2e2e;
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

.edit-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edit-popup {
  background: #ffffff;
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 1000px;
  height: auto;
  max-height: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.edit-popup h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
}

.popup-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  gap: 20px;
}

.left-side {
  width: 45%;
  display: flex;
  flex-direction: column;
}

.right-side {
  width: 50%;
  display: flex;
  flex-direction: column;
}

.left-side textarea {
  width: 100%;
  height: 150px;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  outline: none;
  resize: none;
  margin-bottom: 20px;
}

.left-side textarea:focus {
  border-color: #009de0;
  box-shadow: 0 0 8px rgba(0, 157, 224, 0.5);
}

.left-side input:focus {
  border-color: #009de0;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 157, 224, 0.5);
}

.answers-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 2px solid #ccc;
}

.answers-list .option {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  width: 110%;
  gap: 10px;
}

.answers-list-textinput {
  width: 60%;
  padding: 8px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  background-color: #fff;
  transition: all 0.3s ease;
  outline: none;
}

.answers-list-textinput:focus {
  border-color: #009de0;
  box-shadow: 0 0 5px rgba(0, 157, 224, 0.5);
}

.deleteAnswerButton {
  background-color: #ff4c4c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.deleteAnswerButton:hover {
  background-color: #ff2e2e;
}

.addAnswerButton {
  padding: 10px;
  width: 100%;
  background-color: #009de0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s;
  font-size: 14px;
}

.addAnswerButton:hover {
  background-color: #007bb5;
}

.save-button {
  padding: 10px 30px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  align-self: flex-end;
  margin-top: 20px;
  transition: background-color 0.3s;
  font-size: 16px;
}

.save-button:hover {
  background-color: #45a049;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: transparent;
  border: none;
  color: #009de0;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.close-button:hover {
  color: #ffffff;
}

.dropdown {
  width: 100%;
  padding: 8px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  background-color: #f9f9f9;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  outline: none;
  appearance: none;
  cursor: pointer;
  margin-bottom: 20px;
}

.dropdown:focus {
  border-color: #007acc;
  box-shadow: 0 0 8px rgba(0, 122, 204, 0.6);
  background-color: #fff;
}

.dropdown option {
  font-size: 14px;
  padding: 8px;
  background-color: #fff;
}

.answers-list-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: bold;
  color: #333;
}

.answers-list-labels label {
  flex: 1;
  text-align: left;
}

.answers-list-labels label:last-child {
  text-align: left;
  margin-left: 62%;
}

.labelText {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
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
