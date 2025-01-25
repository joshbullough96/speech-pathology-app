// Script.js

const words = [];
const Words = {};

async function fetchData(sheet){
    const res = await fetch(`https://getsheet.josh-bullough12.workers.dev?sheet=${sheet}`);
    const json = await res.json();
    console.log(json);
    return json;
}

async function fetchsoundTypes() {
    try {

        const sheet1Data = await fetchData('Sheet1');
        const sheet2Data = await fetchData('Sheet2');

        const rows = sheet1Data.values; //.slice(1); // Skip headers
        
        const headers = rows[0];
        
        console.log(headers);
        // console.log(words); // View data in console

        //save all words to object
        rows.slice(1).forEach(row => {  // slice(1) skips the header row
            row.forEach((cell, colIndex) => {  // Iterate through each column in the row
                // don't add blanks
                if(!cell){
                    return;
                }
                
                const soundType = headers[colIndex]; // Get the correct header for this column

                if (!Words[soundType]) {
                    Words[soundType] = [];
                }

                Words[soundType].push(cell);
                words.push({ 'soundType': soundType, 'word': cell });
            });
        });

        console.log(Words, words)

        // Example: Populate a dropdown with words
        const dropdown = document.getElementById("soundTypeDropdown");
        dropdown.innerHTML = '<option> </option>';
        headers.forEach(row => {
            const option = document.createElement("option");
            option.textContent = row; // Assuming 2nd column contains words
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function getWord() {
    const popUp = document.getElementById("popUp");
    popUp.classList.add("hidden");

    const dropdown = document.getElementById("soundTypeDropdown");
    const selectedItem = dropdown.selectedOptions[0].value;
    const matchedWords = Words[selectedItem];
    if(!selectedItem) {
        return;
    }
    await delay(1);
    const randNum = Math.floor(Math.random() * matchedWords.length);
    const randomWord = matchedWords[randNum];
    const wordDisplay = document.getElementById("word");

    wordDisplay.innerText = randomWord.toUpperCase();
    popUp.classList.remove("hidden");
}

async function delay(timeInSeconds) {
    return new Promise(resolve => setTimeout(resolve, timeInSeconds * 1000));
}

// Run the function on page load
window.onload = fetchsoundTypes;

