function setLoadingButton() {
    const searchButton = document.getElementById("searchButton");
    searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    searchButton.disabled = true;
}

function resetSearchButton() {
    const searchButton = document.getElementById("searchButton");
    searchButton.innerHTML = "Search";
    searchButton.disabled = false;
}

function searchAPI() {
    setLoadingButton();

    const query = document.getElementById("query").value;
    const apiUrl = `https://3dash.mg95.dev/search_levels?q=${query}&page=0`;

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

            if (extractedData) {
                displayResults(extractedData);
            } else {
                console.error("Error parsing the response data or no data found.");
            }

            resetSearchButton();
        })
        .catch(error => {
            console.error("Error:", error);
            resetSearchButton();
        });
}

function customParseResponse(data) {
    const difficultyLabels = ["Easy", "Normal", "Hard", "Harder", "Insane", "Demon"];
    const lines = data.split('\n').map(line => line.trim()).filter(line => line !== "");

    const parsedData = [];
    let currentEntry = null;

    for (let i = 0; i < lines.length; i++) {
        if (i % 4 === 0) {
            if (currentEntry) {
                parsedData.push(currentEntry);
            }
            currentEntry = {
                id: lines[i],
                title: '',
                author: '',
                difficulty: ''
            };
        } else if (i % 4 === 1) {
            currentEntry.title = lines[i];
        } else if (i % 4 === 2) {
            currentEntry.author = lines[i];
        } else if (i % 4 === 3) {
            currentEntry.difficulty = difficultyLabels[parseInt(lines[i])];
        }
    }

    if (currentEntry) {
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

        const difficultyImage = document.createElement("img");
        difficultyImage.src = `images/difficulty_${entry.difficulty}.png`;
        difficultyImage.alt = entry.difficulty;
        difficultyImage.classList.add("difficulty-image");

        const levelInfo = document.createElement("div");
        levelInfo.innerHTML = `
            <strong>ID:</strong> ${entry.id}<br>
            <strong>Title:</strong> ${entry.title}<br>
            <strong>Author:</strong> ${entry.author}<br>
        `;

        levelBox.appendChild(difficultyImage);
        levelBox.appendChild(levelInfo);
        resultsList.appendChild(levelBox);
    });
}

