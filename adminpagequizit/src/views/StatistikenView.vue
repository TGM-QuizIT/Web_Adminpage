<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const users = ref([]);
const selectedUserId = ref(null);
const results = ref([]);
const sortBy = ref('resultDateTime');
const sortOrder = ref('desc');
const isLoading = ref(false);
const searchQuery = ref('');
const selectedUserFullname = ref('');
const selectedUserFocus = ref([]);
const chartRef = ref(null);
let chartInstance = null;

const filteredUsers = computed(() => {
  return users.value.filter(user =>
      user.userFullname.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const apiUrl = process.env.VUE_APP_API_URL;
const authKey = process.env.VUE_APP_AUTH_KEY;

const fetchUsers = async () => {
  try {
    const response = await axios.get(`${apiUrl}/user`, {
      headers: { authorization: authKey },
    });
    users.value = response.data.users;
  } catch (error) {
    console.error('Fehler beim Laden der Benutzer:', error);
  }
};

const fetchResults = async () => {
  if (!selectedUserId.value) return;
  isLoading.value = true;
  try {
    const response = await axios.get(`${apiUrl}/result?userId=${selectedUserId.value}`, {
      headers: { authorization: authKey },
    });
    results.value = response.data.results;
    updateChart();
  } catch (error) {
    console.error('Fehler beim Laden der Ergebnisse:', error);
  }
  isLoading.value = false;
};

const fetchSubjects = async () => {
  if (!selectedUserId.value) return;
  try {
    const response = await axios.get(`${apiUrl}/subject?userId=${selectedUserId.value}`, {
      headers: { authorization: authKey },
    });
    selectedUserFocus.value = response.data.subjects;
  } catch (error) {
    console.error('Fehler beim Laden der Fächer:', error);
  }
};

const sortedResults = computed(() => {
  return [...results.value].sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1;
    return a[sortBy.value] > b[sortBy.value] ? modifier : -modifier;
  });
});

const latestResults = computed(() => {
  return [...results.value]
      .sort((a, b) => new Date(b.resultDateTime) - new Date(a.resultDateTime))
      .slice(0, 10)
      .reverse();
});

const formatDate = (dateString) => {
  if (!dateString) return 'Ungültiges Datum';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Ungültiges Datum';

  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleUserSelection = (user) => {
  selectedUserId.value = user.userId;
  selectedUserFullname.value = user.userFullname;
  searchQuery.value = user.userFullname;
  fetchResults();
  fetchSubjects();
  searchQuery.value = '';
};

const updateChart = () => {
  if (!chartRef.value || latestResults.value.length === 0) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartRef.value.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: latestResults.value.map(r => formatDate(r.resultDateTime)),
      datasets: [{
        label: 'Score-Verlauf',
        data: latestResults.value.map(r => r.resultScore),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        fill: true,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Datum' } },
        y: { title: { display: true, text: 'Score' }, beginAtZero: true }
      }
    }
  });
};

watch(results, updateChart);

onMounted(fetchUsers);
</script>

<template>
  <div class="container">
    <div class="content">
      <div class="left-panel">
        <h1>Benutzer auswählen</h1>
        <div class="search-container">
          <input v-model="searchQuery" placeholder="Benutzer suchen..." class="search-box" />
          <div v-if="searchQuery && filteredUsers.length" class="autocomplete-suggestions">
            <ul>
              <li v-for="user in filteredUsers" :key="user.userId" @click="handleUserSelection(user)">
                {{ user.userFullname }} ({{ user.userClass }})
              </li>
            </ul>
          </div>
        </div>

        <div v-if="isLoading" class="loading">Lade Ergebnisse...</div>

        <div v-if="results.length" class="results">
          <h2>Ergebnisse für {{ selectedUserFullname || 'Kein Benutzer ausgewählt' }}</h2>

          <div class="sort-controls">
            <select v-model="sortBy" class="dropdown">
              <option value="resultDateTime">Datum</option>
              <option value="resultScore">Score</option>
              <option value="focusId">Schwerpunkt</option>
            </select>
            <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'" class="sort-button">
              {{ sortOrder === 'asc' ? '▲ Aufsteigend' : '▼ Absteigend' }}
            </button>
          </div>

          <table class="results-table">
            <thead>
            <tr>
              <th>Datum</th>
              <th>Score</th>
              <th v-if="selectedUserFocus.length">Schwerpunkt</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="result in sortedResults" :key="result.resultId">
              <td>{{ formatDate(result.resultDateTime) }}</td>
              <td>{{ result.resultScore }}</td>
              <td v-if="selectedUserFocus.length">
                {{ selectedUserFocus.find(focus => focus.focusId === result.focusId)?.focusName || 'Kein Schwerpunkt' }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="right-panel">
        <h2>Score-Verlauf</h2>
        <div class="chart-container">
          <canvas ref="chartRef"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
}

.content {
  display: flex;
  gap: 20px;
}

.left-panel {
  flex: 1;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-container {
  width: 100%;
  height: 400px;
}

canvas {
  width: 100%;
  height: 100%;
}

.search-box {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.autocomplete-suggestions {
  border: 1px solid #ccc;
  border-radius: 5px;
  background: #fff;
  margin-top: 5px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.autocomplete-suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.autocomplete-suggestions li {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.autocomplete-suggestions li:last-child {
  border-bottom: none;
}

.autocomplete-suggestions li:hover {
  background: #f0f0f0;
}

.dropdown {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  background: #fff;
  cursor: pointer;
  appearance: none;
}

.sort-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.sort-button:hover {
  background: #0056b3;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.results-table th,
.results-table td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: left;
}

.results-table th {
  background: #f8f9fa;
  font-weight: bold;
}

.sort-controls {
  display: flex;
  gap: 2%;
}
</style>