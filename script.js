function mapSongIdToLabel(songId) {
    const songLabels = [
        "Delightful D",
        "Overworld",
        "Blip Stream",
        "Aircraft",
        "Electrobrawl",
        "The Shadow Siege",
        "Amp it Up",
        "Cosmic Growl",
        "Moon Raiders",
        "Devastation",
        "Bright Battle",
        "Overpowered",
        "Luminance",
        "King Gloop",
        "Volcano Meltdown",
        "Icecastel Quarrel",
        "Let the Heist Begin",
        "Grassy Archipelago",
        "Grassy Archipelago at Night",
        "Ice Core",
        "Metal Soul",
        "Sus Confusion"
    ];
    return songLabels[songId];
}

function setLoadingButton() {
    const searchButton = document.getElementById("searchButton");
    searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    searchButton.disabled = true;
}

function resetSearchButton() {
    const searchButton = document.getElementById("searchButton");
    searchButton.innerHTML = '<i class="fas fa-search"></i> Search';
    searchButton.disabled = false;
}

function searchAPI() {
    setLoadingButton();

    const idResultsBox = document.getElementById("idResults");
    idResultsBox.innerHTML = "";

    const query = document.getElementById("query").value;
    const apiUrl = `https://3dash.mg95.dev/search_levels?q=${query}&page=0`;

    hideError('name');

    if (query.trim() === "") {
        alert("Please enter a level name.");
        resetSearchButton();
        return;
    }

    fetch(apiUrl)
        .then(response => response.text())
        .then(data => {
            console.log("API Response:", data);

            const extractedData = customParseResponse(data);

            if (extractedData && extractedData.length > 0) {
                displayResults(extractedData);
            } else {
                console.error("Error parsing the response data or no data found.");
                showError('name');
            }

            resetSearchButton();
        })
        .catch(error => {
            console.error("Error:", error);
            showError('name');
            resetSearchButton();
        });
}

function customParseResponse(data) {
    const difficultyLabels = ["Easy", "Normal", "Hard", "Harder", "Insane", "Demon"];
    const lines = data.split('\n').map(line => line.trim());

    const parsedData = [];
    let currentEntry = {
        id: '',
        title: '',
        author: '',
        difficulty: ''
    };

    for (let i = 0; i < lines.length; i++) {
        const lineData = lines[i];
        if (i % 4 === 0) {
            if (currentEntry.id !== '') {
                parsedData.push(currentEntry);
            }
            currentEntry = {
                id: lineData,
                title: 'N/A',
                author: 'N/A',
                difficulty: 'N/A'
            };
        } else if (i % 4 === 1) {
            currentEntry.title = lineData === '' ? 'N/A' : lineData;
        } else if (i % 4 === 2) {
            currentEntry.author = lineData === '' ? 'N/A' : lineData;
        } else if (i % 4 === 3) {
            const difficulty = parseInt(lineData);
            if (!isNaN(difficulty) && difficulty >= 0 && difficulty < difficultyLabels.length) {
                currentEntry.difficulty = difficultyLabels[difficulty];
            } else {
                currentEntry.difficulty = 'N/A';
            }
        }
    }

    if (currentEntry.id !== '') {
        parsedData.push(currentEntry);
    }

    return parsedData;
}

function displayResults(data) {
    const resultsList = document.getElementById("results");
    resultsList.innerHTML = "";

    data.forEach(entry => {
        const levelBox = document.createElement("li");
        levelBox.classList.add("level-box");

        if (entry.id === '6587' || entry.id === '6588' || entry.id === '6589') {
            const specialImage = document.createElement("img");
            specialImage.src = `images/ANGRY.png`;
            specialImage.alt = `What did you do.`;
            specialImage.classList.add("special-image");
            levelBox.appendChild(specialImage);

            document.body.style.backgroundColor = "black";
            const audio = new Audio('images/boom.mp3');
            audio.play();

            setTimeout(() => {
                document.body.style.backgroundColor = "";
                audio.pause();
            }, 5000);
        } else {
            const difficultyImage = document.createElement("img");
            difficultyImage.src = `images/difficulty_${entry.difficulty}.png`;
            difficultyImage.alt = entry.difficulty;
            difficultyImage.classList.add("difficulty-image");

            const levelInfo = document.createElement("div");
            levelInfo.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <strong>ID:</strong> ${entry.id}
                    <button class="clipboard-button" onclick="copyToClipboard('${entry.id}')">
                        <i class="fas fa-clipboard"></i>
                    </button>
                </div>
                <strong>Title:</strong> ${entry.title}<br>
                <strong>Author:</strong> ${entry.author}<br>
            `;

            levelBox.appendChild(difficultyImage);
            levelBox.appendChild(levelInfo);
        }

        resultsList.appendChild(levelBox);
    });
}




function setIdLoadingButton() {
    const idSearchButton = document.getElementById("idsearchButton");
    idSearchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    idSearchButton.disabled = true;
}

function resetIdSearchButton() {
    const idSearchButton = document.getElementById("idsearchButton");
    idSearchButton.innerHTML = '<i class="fas fa-search"></i> Search';
    idSearchButton.disabled = false;
}

function idsearchAPI() {
    setIdLoadingButton();

    const resultsList = document.getElementById("results");
    resultsList.innerHTML = "";

    const idQuery = document.getElementById("idquery").value;
    const apiUrl = "https://3dash.mg95.dev/get_json";

    hideError('id');

    if (idQuery.trim() === "") {
        alert("Please enter a level ID.");
        resetIdSearchButton();
        return;
    }

    const formData = new URLSearchParams();
    formData.append("id", idQuery);

    fetch(apiUrl, {
        method: "POST",
        body: formData,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
        .then(response => {
            if (response.status === 404) {
                resetIdSearchButton();
                showError('id');
                return Promise.reject({ detail: 'Level Not Found' });
            }
            return response.json();
        })
        .then(data => {
            console.log("API Response:", data);

            if (data) {
                levelDataGlobal = data.levelData;
                displayIdResults(data);
                analyzeLevelData(data.levelData);
            } else {
                console.error("No data found for the given ID.");
                showError('id');
            }
            resetIdSearchButton();
        })
        .catch(error => {
            if (error.detail === 'Level Not Found') {
                showError('id');
            } else {
                console.error("Error:", error);
            }
            resetIdSearchButton();
        });
}


function analyzeLevelData(levelData) {
    const blockIds = [
        "Regular Block", "Grid Block", "Half Block", "Spike", "Spike Group", "Sawblade",
        "Spikeball", "Slope", "Magenta Pad", "Yellow Pad", "Red Pad", "Cyan Pad", "Magenta Orb",
        "Yellow Orb", "Red Orb", "Cyan Orb", "Green Orb", "Black Orb", "Normal Gravity Portal",
        "Reversed Gravity Portal", "Cube Portal", "Ship Portal", "Wave Portal", "UFO Portal",
        "Hedron Portal", "Normal-Size Portal", "Small-Size Portal", "Normal-Speed Portal (1x)",
        "Fast-Speed Portal (2x)", "Super-Speed Portal (3x)", "Chain", "Color Changer", "End Light",
        "Cosmic Grid Block", "Cosmic Spike", "Cosmic Chain"
    ];

    const blockIdCount = {};

    for (let i = 0; i < levelData.length; i += 5) {
        const blockId = levelData[i];
        const count = blockIdCount[blockId] || 0;
        blockIdCount[blockId] = count + 1;
    }

    const result = Object.entries(blockIdCount)
        .map(([blockId, count]) => {
            return `${blockIds[blockId]} - ${count === 1 ? "1 time" : `${count} times`}`;
        });

    return result;
}

function displayIdResults(data) {
    const idResultsBox = document.getElementById("idResults");

    const difficultyLabels = ["Easy", "Normal", "Hard", "Harder", "Insane", "Demon"];
    const difficultyIcons = ["difficulty_Easy.png", "difficulty_Normal.png", "difficulty_Hard.png", "difficulty_Harder.png", "difficulty_Insane.png", "difficulty_Demon.png"];

    // Create a container div for the level info and analysis
    const container = document.createElement("div");
    container.classList.add("level-container");

    // Create a div for the level info
    const levelInfo = document.createElement("div");
    levelInfo.classList.add("level-info"); // Add a class to style the level info
    levelInfo.innerHTML = `
        <strong>${data.name}</strong><br>
        by <strong>${data.author}</strong><br>
        <strong>Difficulty:</strong> ${difficultyLabels[data.difficulty]}<br>
        <strong>Song ID:</strong> ${mapSongIdToLabel(data.songId)}<br>
        <strong>Song Start Time:</strong> ${data.songStartTime} ms<br>
        <strong>Floor ID:</strong> ${data.floorId}<br>
        <strong>Background ID:</strong> ${data.backgroundId}<br>
        <strong>Starting Color (RGB):</strong> ${data.startingColor}<br>
        <div class="play-container">
            <button class="play-button" onclick="playSong('${mapSongIdToLabel(data.songId)}', ${data.songStartTime}, ${data.initialVolume});"><img src="images/playsong.png" alt="Play Song" class="play-icon" /></button>
            <audio id="audioElement" controls>
                <source src="" type="audio/mpeg">
            </audio>
        </div>
        <img src="images/${difficultyIcons[data.difficulty]}" alt="Difficulty Icon" class="difficulty-icon">
    `;

    // Create a div for the level analysis
    const analysisInfo = document.createElement("div");
    analysisInfo.classList.add("level-analysis"); // Add a class to style the level analysis
    const analysisResult = analyzeLevelData(data.levelData);
    analysisInfo.innerHTML = "<strong>Level Analysis:</strong><br>" + analysisResult.join("<br>");

    // Append the level info and analysis to the container
    container.appendChild(levelInfo);
    container.appendChild(analysisInfo);

    idResultsBox.innerHTML = ""; // Clear any existing content
    idResultsBox.appendChild(container);
}

document.getElementById("query").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        searchAPI();
    }
});

document.getElementById("idquery").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        idsearchAPI();
    }
});

function playSong(songName, songStartTime, initialVolume = 0.25) {
    const songURLs = {
        "Delightful D": "images/delightful-d.mp3",
        "Overworld": "images/overworld.mp3",
        "Blip Stream": "images/blip-stream.mp3",
        "Aircraft": "images/aircraft.mp3",
        "Electrobrawl": "images/electrobrawl.mp3",
        "The Shadow Siege": "images/the-shadow-siege.mp3",
        "Amp it Up": "images/amp-it-up.mp3",
        "Cosmic Growl": "images/cosmic-growl.mp3",
        "Moon Raiders": "images/moon-raiders.mp3",
        "Devastation": "images/devastation.mp3",
        "Bright Battle": "images/bright-battle.mp3",
        "Overpowered": "images/overpowered.mp3",
        "Luminance": "images/luminance.mp3",
        "King Gloop": "images/king-gloop.mp3",
        "Volcano Meltdown": "images/volcano-meltdown.mp3",
        "Icecastel Quarrel": "images/icecastel-quarrel.mp3",
        "Let the Heist Begin": "images/let-the-heist-begin.mp3",
        "Grassy Archipelago": "images/grassy-archipelago.mp3",
        "Grassy Archipelago at Night": "images/grassy-archipelago-night.mp3",
        "Ice Core": "images/ice-core.mp3",
        "Metal Soul": "images/metal-soul.mp3",
        "Sus Confusion": "images/sus-confusion.mp3"
    };

    const audioElement = document.getElementById("audioElement");

    if (songURLs.hasOwnProperty(songName)) {
        audioElement.src = songURLs[songName];
        audioElement.load();
        audioElement.currentTime = songStartTime / 1000; // Convert milliseconds to seconds
        audioElement.volume = initialVolume;
        audioElement.play();
    } else {
        console.error("Song not found:", songName);
    }
}

function showError(type) {
    if (type === 'name') {
        document.getElementById('nameError').style.display = 'block';
    } else if (type === 'id') {
        document.getElementById('idError').style.display = 'block';
    }
}

function hideError(type) {
    if (type === 'name') {
        document.getElementById('nameError').style.display = 'none';
    } else if (type === 'id') {
        document.getElementById('idError').style.display = 'none';
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard: " + text);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}