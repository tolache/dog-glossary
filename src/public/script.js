const showRandomDogButton = document.getElementById("button-random-dog");
showRandomDogButton.addEventListener("click", async (event) => {
    await buttonClickEventHandler(event.target);
});

const showBreedButton = document.getElementById("button-show-breed");
showBreedButton.addEventListener("click", async (event) => {
    await buttonClickEventHandler(event.target);
});

const showSubBreedButton = document.getElementById("button-show-sub-breed");
showSubBreedButton.addEventListener("click", async (event) => {
    await buttonClickEventHandler(event.target);
});

const showAllBreedsButton = document.getElementById("button-show-all");
showAllBreedsButton.addEventListener("click", async (event) => {
    await buttonClickEventHandler(event.target);
});

const contentDiv = document.getElementById("content");

async function buttonClickEventHandler(eventTarget) {
    switch (eventTarget) {
        case showRandomDogButton:
            await showRandomDog();
            break;
        case showBreedButton:
            await showRandomDogByBreed();
            break;
        case showSubBreedButton:
            await showSubBreed();
            break;
        case showAllBreedsButton:
            await showAllBreeds();
            break;
        default:
            throw new Error("Unexpected button was clicked.");
    }
}

async function showRandomDog() {
    try {
        const imageUrl = await fetchDogImageUrl();
        populateContentWithResult(imageUrl);
    }
    catch (e) {
        console.error(e);
        populateContentWithError();
    }
}

async function showRandomDogByBreed() {
    const breedInputField = document.getElementById("input-breed");
    const breed = breedInputField.value;
    try {
        const imageUrl = await fetchDogImageUrl(breed);
        populateContentWithResult(imageUrl);
    }
    catch (e) {
        populateContentWithError();
    }
}

async function showSubBreed() {
    const breedInputField = document.getElementById("input-breed");
    const breed = breedInputField.value;
    try {
        const subBreedList = await fetchSubBreedList(breed);
        populateContentWithResult(subBreedList);
    }
    catch (e) {
        if (e.message === "No sub-breeds found!") {
            populateContentWithError(e.message);
        }
        else {
            populateContentWithError();
        }
    }
}

async function showAllBreeds() {
    try {
        const allBreedsArray = await fetchAllBreeds();
        populateContentWithResult(allBreedsArray);
    }
    catch (e) {
        populateContentWithError(`Failed to fetch all breeds: ${e.message}`);
    }
}


async function fetchDogImageUrl(breed = "random") {
    let url;
    breed = normalizeBreedName(breed);
    if (breed === "random") {
        url = "https://dog.ceo/api/breeds/image/random";
    }
    else {
        url = `https://dog.ceo/api/breed/${normalizeBreedName(breed)}/images/random`;
    }
    return await fetchMessage(url);
}

async function fetchSubBreedList(breed){
    breed = normalizeBreedName(breed);
    const url = `https://dog.ceo/api/breed/${breed}/list`;
    return await fetchMessage(url);
}

async function fetchAllBreeds() {
    const url = "https://dog.ceo/api/breeds/list/all";
    return await fetchMessage(url);
}

function normalizeBreedName(name) {
    return name.trim().toLocaleLowerCase();
}

async function fetchMessage(url) {
    try {
        const response = await fetch(url);
        if (response.status === 404) {
            throw new Error("Breed not found");
        }
        if (response.status < 200 || response.status > 204) {
            throw new Error(`Response status code '${response.status}' does not indicate success`);
        }
        const responseJson = await response.json();
        if (responseJson.status !== "success") {
            throw new Error(`Response JSON status '${responseJson.status}' is not 'success'`);
        }
        return responseJson.message;
    }
    catch (e) {
        throw new Error("Failed to fetch dog image");
    }
}

function populateContentWithResult(message) {
    clearContent();
    let contentChild;
    if (typeof message === "string" && message.startsWith("http")) {
        contentChild = generateImgElement(message);
    }
    else if (Array.isArray(message)) {
        contentChild = generateSubBreedOlElement(message);
    }
    else {
        contentChild = generateAllBreedsOlElement(message);
    }
    contentDiv.appendChild(contentChild);
}

function clearContent() {
    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild)
    }
}

function generateImgElement(url) {
    let imgElement = document.createElement("img");
    imgElement.src = url;
    imgElement.alt = "random dog image";
    return imgElement;
}

function generateSubBreedOlElement(subBreedArray) {
    if (!subBreedArray.length > 0) {
        throw new Error("No sub-breeds found!");
    }
    let olElement = document.createElement("ol");
    subBreedArray.forEach((element) => {
        let liElement = document.createElement("li");
        liElement.innerHTML = element;
        olElement.appendChild(liElement);
    });
    return olElement;
}

function generateAllBreedsOlElement(allBreedsJson) {
    const breedList = Object.entries(allBreedsJson);
    let olElement = document.createElement("ol");
    breedList.forEach((entry) => {
        const breed = entry[0];
        const subBreedArray = entry[1];
        let breedLiElement = document.createElement("li");
        breedLiElement.innerHTML = breed;
        if (subBreedArray.length > 0) {
            let ulElement = document.createElement("ul");
            subBreedArray.forEach((subBreed) => {
                const subBreedLiElement = document.createElement("li");
                subBreedLiElement.innerHTML = subBreed;
                ulElement.appendChild(subBreedLiElement);
            });
            breedLiElement.appendChild(ulElement);
        }
        olElement.appendChild(breedLiElement);
    });
    return olElement;
}

function populateContentWithError(errorMessage = "Breed not found!") {
    clearContent();
    let pElement = document.createElement("p");
    pElement.textContent = errorMessage;
    contentDiv.appendChild(pElement);
}