const rankingList = document.querySelector("#ranking-list");
const statusMessage = document.querySelector("#status");
const typeFilter = document.querySelector("#type-filter");
const rideCount = document.querySelector("#ride-count");
const topScore = document.querySelector("#top-score");
const totalRidden = document.querySelector("#total-ridden");

let rides = [];

function sortByScore(items) {
  return [...items].sort((a, b) => b.score - a.score);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(value);
}

function populateTypeFilter(items) {
  const types = [...new Set(items.map((ride) => ride.type))].sort();

  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeFilter.append(option);
  });
}

function updateSummary(items) {
  const sorted = sortByScore(items);
  const riddenCount = items.reduce((total, ride) => total + ride.timesRidden, 0);

  rideCount.textContent = items.length;
  topScore.textContent = sorted[0]?.score.toFixed(1) ?? "0.0";
  totalRidden.textContent = formatNumber(riddenCount);
}

function createRideCard(ride, index) {
  const card = document.createElement("article");
  card.className = "ride-card";
  card.innerHTML = `
    <div class="rank" aria-label="Rank ${index + 1}">${index + 1}</div>
    <div class="ride-main">
      <div class="ride-title">
        <h3>${ride.name}</h3>
        <span class="tag">${ride.type}</span>
      </div>
      <p class="meta">${ride.park} · ${ride.location}, ${ride.country} · ${ride.signature}</p>
      <ul class="specs" aria-label="${ride.name} specifications">
        <li>${formatNumber(ride.timesRidden)} times ridden</li>
        <li>${ride.heightFt} ft</li>
        <li>${ride.speedMph} mph</li>
        <li>${ride.inversions} inversions</li>
        <li>Opened ${ride.opened}</li>
      </ul>
    </div>
    <div class="score">
      <strong>${ride.score.toFixed(1)}</strong>
      <span>Score</span>
    </div>
  `;

  return card;
}

function render() {
  const selectedType = typeFilter.value;
  const filtered = selectedType === "all"
    ? rides
    : rides.filter((ride) => ride.type === selectedType);

  const sorted = sortByScore(filtered);
  rankingList.replaceChildren(...sorted.map(createRideCard));
  statusMessage.textContent = sorted.length
    ? `Showing ${sorted.length} ranked ${sorted.length === 1 ? "ride" : "rides"}.`
    : "No rides match that type.";
}

async function loadRankings() {
  try {
    statusMessage.textContent = "Loading rankings...";
    const response = await fetch("rollercoasters.json");

    if (!response.ok) {
      throw new Error(`Could not load rankings: ${response.status}`);
    }

    rides = sortByScore(await response.json());
    populateTypeFilter(rides);
    updateSummary(rides);
    render();
  } catch (error) {
    rankingList.replaceChildren();
    statusMessage.textContent = "The ranking JSON could not be loaded. Try opening this page through a local web server.";
    console.error(error);
  }
}

typeFilter.addEventListener("change", render);
loadRankings();
