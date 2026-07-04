// ================= HOME PAGE: LATEST MATCHES =================

const matchList = document.getElementById("matchList");
const matchesLoading = document.getElementById("matchesLoading");

// fetch last Premier League results (league id 4328)
async function getLatestMatches() {
    try {
        const response = await fetch("https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=4328");
        const data = await response.json();

        matchesLoading.style.display = "none";
        showMatches(data.events);
    } catch (error) {
        matchesLoading.textContent = "Could not load matches, try again later.";
        console.log(error);
    }
}

// show matches on the home page
function showMatches(events) {
    // only show first 6 matches
    const matches = events.slice(0, 6);

    matches.forEach(function (match) {
        const card = document.createElement("div");
        card.className = "match-card";

        card.innerHTML = `
            <span class="team-name">${match.strHomeTeam}</span>
            <div>
                <span class="score">${match.intHomeScore} : ${match.intAwayScore}</span>
                <span class="match-date">${match.dateEvent}</span>
            </div>
            <span class="team-name away">${match.strAwayTeam}</span>
        `;

        matchList.appendChild(card);
    });
}

if (matchList) {
    getLatestMatches();
}

// ================= TEAMS PAGE =================

const teamGrid = document.getElementById("teamGrid");
const searchInput = document.getElementById("searchInput");
const leagueFilters = document.getElementById("leagueFilters");
const teamsTitle = document.getElementById("teamsTitle");
const loading = document.getElementById("loading");

let allTeams = [];

// fetch teams from the API with async/await
async function getTeams(league) {
    try {
        loading.style.display = "block";
        loading.textContent = "Loading teams...";
        teamGrid.innerHTML = "";

        const url = "https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=" + encodeURIComponent(league);
        const response = await fetch(url);
        const data = await response.json();

        allTeams = data.teams;
        loading.style.display = "none";
        showTeams(allTeams);
    } catch (error) {
        loading.textContent = "Something went wrong, try again later.";
        console.log(error);
    }
}

// show teams on the page
function showTeams(teams) {
    teamGrid.innerHTML = "";

    teams.forEach(function (team) {
        const card = document.createElement("div");
        card.className = "team-card";

        card.innerHTML = `
            <img src="${team.strBadge}" alt="${team.strTeam}">
            <h3>${team.strTeam}</h3>
            <p>Founded: ${team.intFormedYear}</p>
            <button class="fav-btn" data-name="${team.strTeam}">Add to Favorites</button>
        `;

        teamGrid.appendChild(card);
    });

    updateFavButtons();
}

// league filter buttons
if (leagueFilters) {
    leagueFilters.addEventListener("click", function (event) {
        if (event.target.classList.contains("filter-btn")) {
            // remove active class from all buttons
            const buttons = document.querySelectorAll(".filter-btn");
            buttons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            // add active class to the clicked button
            event.target.classList.add("active");

            teamsTitle.textContent = event.target.textContent + " Teams";
            searchInput.value = "";
            getTeams(event.target.dataset.league);
        }
    });
}

// search filter
if (searchInput) {
    searchInput.addEventListener("input", function () {
        const text = searchInput.value.toLowerCase();
        const filtered = allTeams.filter(function (team) {
            return team.strTeam.toLowerCase().includes(text);
        });
        showTeams(filtered);
    });
}

// ================= FAVORITES (localStorage) =================

function getFavorites() {
    const favs = localStorage.getItem("favorites");
    if (favs) {
        return JSON.parse(favs);
    } else {
        return [];
    }
}

function toggleFavorite(name) {
    let favorites = getFavorites();

    if (favorites.includes(name)) {
        favorites = favorites.filter(function (fav) {
            return fav !== name;
        });
    } else {
        favorites.push(name);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavButtons();
}

// update button styles for favorited teams
function updateFavButtons() {
    const favorites = getFavorites();
    const buttons = document.querySelectorAll(".fav-btn");

    buttons.forEach(function (btn) {
        if (favorites.includes(btn.dataset.name)) {
            btn.classList.add("favorited");
            btn.textContent = "★ Favorite";
        } else {
            btn.classList.remove("favorited");
            btn.textContent = "Add to Favorites";
        }
    });
}

// event delegation for favorite buttons + first load
if (teamGrid) {
    teamGrid.addEventListener("click", function (event) {
        if (event.target.classList.contains("fav-btn")) {
            toggleFavorite(event.target.dataset.name);
        }
    });

    getTeams("English Premier League");
}

// ================= CONTACT FORM =================

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        const nameError = document.getElementById("nameError");
        const emailError = document.getElementById("emailError");
        const messageError = document.getElementById("messageError");
        const successMsg = document.getElementById("successMsg");

        // clear old errors
        nameError.textContent = "";
        emailError.textContent = "";
        messageError.textContent = "";
        successMsg.textContent = "";

        let isValid = true;

        // name validation
        if (name === "") {
            nameError.textContent = "Name is required";
            isValid = false;
        } else if (name.length < 3) {
            nameError.textContent = "Name must be at least 3 characters";
            isValid = false;
        }

        // email validation
        if (email === "") {
            emailError.textContent = "Email is required";
            isValid = false;
        } else if (!email.includes("@") || !email.includes(".")) {
            emailError.textContent = "Please enter a valid email";
            isValid = false;
        }

        // message validation
        if (message === "") {
            messageError.textContent = "Message is required";
            isValid = false;
        } else if (message.length < 10) {
            messageError.textContent = "Message must be at least 10 characters";
            isValid = false;
        }

        if (isValid) {
            // save the message in localStorage
            const messages = JSON.parse(localStorage.getItem("messages")) || [];
            messages.push({
                name: name,
                email: email,
                message: message,
                date: new Date().toLocaleString()
            });
            localStorage.setItem("messages", JSON.stringify(messages));

            successMsg.textContent = "Thank you " + name + ", your message was sent!";
            contactForm.reset();
        }
    });
}
