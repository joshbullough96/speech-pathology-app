// Script.js

class Word {
    constructor(word, soundType = null, wordType = null) {
        this.word = word;         // The actual word
        this.soundType = soundType; // The type of sound (e.g., "R", "S")
        this.wordType = wordType;   // The type/category of the word
    }

    // Method to update wordType
    setSoundType(newSoundType) {
        this.soundType = newSoundType;
    }

    // Method to update wordType
    setWordType(newWordType) {
        this.wordType = newWordType;
    }

    // Optional: Add methods to the class if needed
    describe() {
        return `Word: ${this.word}, Sound Type: ${this.soundType}, Word Type: ${this.wordType}`;
    }
}

const words = [];

// Function to check if a word already exists
function doesWordExist(wordToCheck) {
    return words.some(word => word.word === wordToCheck);
}

async function fetchData(sheet) {
    const res = await fetch(`https://getsheet.josh-bullough12.workers.dev?sheet=${sheet}`);
    const json = await res.json();
    return json;
}

async function fetchAndParseSheet(sheet, hasHeaders = true) {

    const data = await fetchData(sheet);

    const headers = hasHeaders ? data.values[0] : null;

    const rows = hasHeaders ? data.values.slice(1) : data.values;

    return [headers, rows];

}

function buildWords(headers, rows, sheet) {
    rows.forEach(row => {
        row.forEach((cell, colIndex) => {  // Iterate through each column in the row
            // don't add blanks
            if (!cell) {
                return;
            }

            let word;

            //don't want to create duplicates
            if (!doesWordExist(cell)) {
                word = new Word(cell);
                words.push(word);
            } else {
                word = words.find(x => x.word === cell);
            }

            if (sheet.type === 'soundType') {
                const soundType = headers[colIndex];
                word.setSoundType(soundType);
            }
            if (sheet.type === 'wordType') {
                const wordType = headers[colIndex];
                word.setWordType(wordType);
            }

        });
    });
}

function populateDropdown(headers, sheet) {
    const dropdown = document.getElementById(`${sheet.type}Dropdown`);
    dropdown.innerHTML = '<option> </option>';
    headers.forEach(row => {
        const option = document.createElement("option");
        option.textContent = row;
        dropdown.appendChild(option);
    });
}

async function fetchSoundTypes() {

    const sheets = [{ sheetName: 'Sheet1', type: 'soundType' }, { sheetName: 'Sheet2', type: 'wordType' }];

    try {

        for (let sheet of sheets) {

            const [headers, rows] = await fetchAndParseSheet(sheet.sheetName);
            buildWords(headers, rows, sheet);
            populateDropdown(headers, sheet);

        }

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function getWord() {

    // DOM elements
    const wordDisplay = document.getElementById("word");
    const popUp = document.getElementById("popUp");

    // clear text & classes
    wordDisplay.innerText = '';
    popUp.classList.add("hidden");
    popUp.classList.remove("error");
    popUp.classList.remove("success");

    const soundTypeDropdown = document.getElementById("soundTypeDropdown");
    const selectedSoundType = soundTypeDropdown.selectedOptions[0].value;

    const wordTypeDropdown = document.getElementById("wordTypeDropdown");
    const selectedWordType = wordTypeDropdown.selectedOptions[0].value;

    console.log(selectedSoundType, selectedWordType);

    const filteredWords = words.filter(word => {
        if (selectedSoundType && selectedWordType) {
            return word.soundType === selectedSoundType && word.wordType === selectedWordType;
        } else if (selectedSoundType) {
            return word.soundType === selectedSoundType;
        } else if (selectedWordType) {
            return word.wordType === selectedWordType;
        }
        return true; // Return all words if no filters are selected
    });

    await delay(1);
    const randNum = Math.floor(Math.random() * (filteredWords.length));
    const randomWord = filteredWords[randNum];

    if (randomWord) {
        wordDisplay.innerText = randomWord.word.toUpperCase();
        popUp.classList.add("success");
    } else {
        popUp.classList.add("error");
        wordDisplay.innerText = 'Hmmm... no words here! Let’s try something else!';
    }

    popUp.classList.remove("hidden");

}

async function delay(timeInSeconds) {
    return new Promise(resolve => setTimeout(resolve, timeInSeconds * 1000));
}

// Run the function on page load
window.onload = fetchSoundTypes;

