const rankingList = document.querySelector("#ranking-list");
const statusMessage = document.querySelector("#status");
const parkFilter = document.querySelector("#park-filter");
const sortSelect = document.querySelector("#sort-select");
const sortLabel = document.querySelector("#sort-label");
const rideCount = document.querySelector("#ride-count");
const topScore = document.querySelector("#top-score");
const totalRidden = document.querySelector("#total-ridden");

let rides = [];

const sortOptions = {
  score: { label: "score", value: (ride) => ride.score },
  heightFt: { label: "height", value: (ride) => ride.heightFt },
  speedMph: { label: "speed", value: (ride) => ride.speedMph },
  inversions: { label: "inversions", value: (ride) => ride.inversions },
  opened: { label: "newest", value: (ride) => ride.opened }
};

function formatNumber(value) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(value);
}

function sortRankings(items, sortKey = "score") {
  const activeSort = sortOptions[sortKey] ?? sortOptions.score;

  return [...items].sort((a, b) => {
    const primary = activeSort.value(b) - activeSort.value(a);
    return primary || b.score - a.score || a.name.localeCompare(b.name);
  });
}

function populateParkFilter(items) {
  const parks = [...new Set(items.map((ride) => ride.park))].sort();

  parks.forEach((park) => {
    const option = document.createElement("option");
    option.value = park;
    option.textContent = park;
    parkFilter.append(option);
  });
}

function updateSummary(items) {
  const sorted = sortRankings(items);
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
  const selectedPark = parkFilter.value;
  const selectedSort = sortSelect.value;
  const filtered = selectedPark === "all"
    ? rides
    : rides.filter((ride) => ride.park === selectedPark);

  const sorted = sortRankings(filtered, selectedSort);
  const sortName = sortOptions[selectedSort]?.label ?? "score";

  rankingList.replaceChildren(...sorted.map(createRideCard));
  sortLabel.textContent = `Sorted by ${sortName}`;
  statusMessage.textContent = sorted.length
    ? `Showing ${sorted.length} ${sorted.length === 1 ? "ride" : "rides"} sorted by ${sortName}.`
    : "No rides match that theme park.";
}

async function loadRankings() {
  try {
    statusMessage.textContent = "Loading rankings...";
    const response = await fetch("rollercoasters.json");

    if (!response.ok) {
      throw new Error(`Could not load rankings: ${response.status}`);
    }

    rides = sortRankings(await response.json());
    populateParkFilter(rides);
    updateSummary(rides);
    render();
  } catch (error) {
    rankingList.replaceChildren();
    statusMessage.textContent = "The ranking JSON could not be loaded. Try opening this page through a local web server.";
    console.error(error);
  }
}

parkFilter.addEventListener("change", render);
sortSelect.addEventListener("change", render);
loadRankings();
