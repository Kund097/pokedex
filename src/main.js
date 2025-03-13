//Construir una pokedex https://pokeapi.co/

//Consultar documentación https://pokeapi.co/docs/v2.html#
//Listar pokemones, y poder cambiar de página
//Ver detalles de 1 pokemon, incluyendo al menos 1 foto
// const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

addEventListener("load", render());
async function getPokemons(URL) {
    try {
        const response = await fetch(URL);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error(response.status);
        }
    } catch (error) {
        console.error(
            "Error al realizar la petición o procesar los datos: ",
            error
        );
    }
}

async function render(URL = "https://pokeapi.co/api/v2/pokemon") {
    const pokemonApi = await getPokemons(URL);
    const results = pokemonApi.results;
    console.log(results);
    const $tBody = document.querySelector(".table-pokemons");
    results.forEach(({ name, url }) => {
        console.log(name, url);
        const POKE_ID = getPokemonId(url);
        insertPokemon(POKE_ID);
        // $tBody.appendChild(createAndInsertPokemonRow(name, POKE_ID));
    });
    insertUrlNextList(pokemonApi);
    insertUrlPreviousList(pokemonApi);
}

async function insertPokemon(id) {
    const src = await getPokemonDefaultImg(id);
    insertRowImg(src, id);
}

async function getPokemonDefaultImg(id) {
    const URL = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const response = await getPokemons(URL);
    const imgUrl = await response.sprites.front_default;
    // const imgUrl = await response.sprites.other.dream_world.front_default;
    return imgUrl;
}

function insertRowImg(src, id) {
    const $fatherElement = document.querySelector(".row");
    const $colImg = createColImg();
    const $cardImg = createCardImg();
    const $img = createImg(src, id);

    $fatherElement.appendChild($colImg);
    $colImg.appendChild($cardImg);
    $cardImg.appendChild($img);
}

function createColImg() {
    const $colImg = document.createElement("div");
    $colImg.classList.add("col");
    $colImg.classList.add("border");
    $colImg.classList.add("border-0");
    $colImg.classList.add("p-2");
    return $colImg;
}

function createCardImg() {
    const $cardImg = document.createElement("div");
    $cardImg.classList.add("card");
    $cardImg.classList.add("shadow-sm");
    return $cardImg;
}

function createImg(src, id) {
    const $img = document.createElement("img");
    $img.classList.add("img-thumbnail");
    $img.classList.add("pokemon-img");
    // $img.classList.add("img-fluid");
    $img.src = src;
    $img.id = id;
    // $img.width = 1000;
    // $img.height = 1000;
    $img.setAttribute("data-bs-toggle", "modal");
    $img.setAttribute("data-bs-target", "#pokemonModal");
    return $img;
}

function createAndInsertPokemonRow(name, id) {
    const { $tr, $thName, $thId, $thButton, $button } = createTableElements();
    configureButton($button, id);
    $thName.textContent = name;
    $thName.scope = "row";
    $thId.textContent = id;

    $tr.id = id;
    $tr.appendChild($thName);
    $tr.appendChild($thId);
    $thButton.appendChild($button);
    $tr.appendChild($thButton);
    return $tr;
}

function createTableElements() {
    const $tr = document.createElement("tr");
    const $thName = document.createElement("th");
    const $thId = document.createElement("th");
    const $thButton = document.createElement("th");
    const $button = document.createElement("button");
    $tr.className = "table-active";
    return { $tr, $thName, $thId, $thButton, $button };
}

function configureButton($button, id) {
    $button.textContent = "Ver";
    $button.id = id;
    $button.className = "btn btn-primary btn-pokemon";
    $button.setAttribute("data-bs-toggle", "modal");
    $button.setAttribute("data-bs-target", "#pokemonModal");
}

function getPokemonId(URL) {
    const regEx = new RegExp(/(\d+)\/?$/);
    const id = URL.match(regEx)[1];
    return id;
}

function insertUrlNextList(currentApi) {
    if (currentApi.next) {
        const $anchorElement = document.querySelectorAll(".next-page");
        $anchorElement.forEach(($anchor) => {
            $anchor.setAttribute("target", `${currentApi.next}`);
        });
    }
}

function insertUrlPreviousList(currentApi) {
    if (currentApi.previous) {
        const $anchorElement = document.querySelectorAll(".previous-page");
        $anchorElement.forEach(($anchor) => {
            $anchor.setAttribute("target", `${currentApi.previous}`);
        });
    }
}

document.querySelectorAll(".page-btn").forEach(($element) => {
    $element.addEventListener("click", handlePagination);
});
function handlePagination(event) {
    event.preventDefault();
    console.log(event.target);
    const $anchorElement = event.target;
    const value = $anchorElement.name || null;
    const url = $anchorElement.target;
    const buttonFunctions = {
        next: nextList,
        previous: previousList,
        null: () => {},
    };
    buttonFunctions[value](url);
}

function nextList(nextUrl) {
    console.log("estoy en next", nextUrl);
    removeTrElements();
    removePokemons();
    render(nextUrl);
}

function previousList(previousUrl) {
    console.log("estoy en previo");
    removeTrElements();
    removePokemons();
    render(previousUrl);
}

function removePokemons() {
    const $cols = document.querySelectorAll(".col");
    for (const element of $cols) {
        element.remove();
    }
}

function removeTrElements() {
    const $trTable = document.querySelectorAll(".table-active");

    $trTable.forEach(($element) => {
        $element.remove();
    });
}

async function handlePokemonBtn(event) {
    const target = event.target;
    if (target.classList.contains("pokemon-img")) {
        // debugger;
        console.log("me hiciste click en pokemon img", target);
        const pokemonId = target.id;
        const URL_POKEMON = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
        const pokemon = await getPokemons(URL_POKEMON);
        console.log(pokemon.name);
        insertPokemonData(pokemon);
    }
}

document.querySelector(".row").addEventListener("click", handlePokemonBtn);

function log(text) {
    console.log(text);
}

async function insertPokemonData(pokemon) {
    const $pokeCard = document.querySelector(".poke-card");
    $pokeCard.classList.remove("visually-hidden");
    handlePokemonImg($pokeCard, pokemon);
    document.querySelector(".modal-title").textContent = pokemon.name;
    insertPokemonEntries($pokeCard, await getPokemonEntry(pokemon.id));
    insertPokemonInformation($pokeCard, pokemon);
}

function insertPokemonInformation($pokeCard, pokemon) {
    const height = formatHeight(pokemon.height);
    const weight = formatWeight(pokemon.weight);

    $pokeCard.querySelector(
        ".height"
    ).innerHTML = `<strong>Altura: </strong>${height} m`;
    $pokeCard.querySelector(
        ".weight"
    ).innerHTML = `<strong>Peso: </strong>${weight} kg`;
}

function formatWeight(weight = 1000) {
    const convertedToArray = String(weight).split("");
    let weightFormatted;
    convertedToArray.splice(convertedToArray.length - 1, 0, ",");
    weightFormatted = convertedToArray.join("");

    return weightFormatted;
}

function formatHeight(height = 7) {
    const convertedToArray = String(height).split("");
    let heightFormatted;
    if (convertedToArray.length === 1) {
        convertedToArray.unshift("0");
    }

    convertedToArray.splice(convertedToArray.length - 1, 0, ",");
    heightFormatted = convertedToArray.join("");
    return heightFormatted;
}

function handlePokemonImg($pokeCard, pokemon) {
    const listImages = getListAllOfficialArtWork(pokemon.sprites);
    insertListImage($pokeCard, listImages);
}

function getListAllOfficialArtWork(pokemonImg) {
    const artWorks = pokemonImg.other["official-artwork"];
    const imagesList = Object.values(artWorks);
    return imagesList;
}

function insertListImage($pokeCard, imageList) {
    const $caroulselInner = $pokeCard.querySelector(".carousel-inner");
    removePreviousCarouselItem($caroulselInner);
    imageList.forEach((imageUrl, index) => {
        const $carouselItem = createCarouselItem(index, imageUrl);
        $caroulselInner.appendChild($carouselItem);
    });
}

function createCarouselItem(index, imageUrl) {
    const types = ["Normal", "Shiny"];
    const $carouselItem = document.createElement("div");
    const $img = document.createElement("img");
    const $caption = document.createElement("div");
    modifyCarouselItem($carouselItem, $img, $caption);
    $img.src = imageUrl;
    if (index === 0) {
        $carouselItem.classList.add("active");
        $caption.querySelector("h5").textContent = types[0];
    } else {
        $caption.querySelector("h5").textContent = types[1];
    }
    return $carouselItem;
}

function modifyCarouselItem($carouselItem, $img, $caption) {
    $caption.appendChild(document.createElement("h5"));
    $caption.classList.add("text-center");
    $carouselItem.classList.add("carousel-item");
    $img.classList.add("card-img-top");
    $img.classList.add("poke-img");
    $carouselItem.appendChild($caption);
    $carouselItem.appendChild($img);
}

function removePreviousCarouselItem($caroulselInner) {
    const $carouselItem = $caroulselInner.querySelectorAll(".carousel-item");
    $carouselItem.forEach(($item) => {
        $item.remove();
    });
}

async function getPokemonEntry(id) {
    const URL = `https://pokeapi.co/api/v2/pokemon-species/${id}/`;
    const data = await getPokemons(URL);
    if (data !== undefined) {
        const dataEntries = data.flavor_text_entries;
        const spanishEntries = dataEntries.filter(
            (flavorText) => flavorText.language.name == "es"
        );
        console.log(spanishEntries);
        return spanishEntries;
    }
}

function insertPokemonEntries($pokeCard, entries) {
    const $pokeBody = $pokeCard.querySelector(".poke-card-body");
    const pokemonEntry = getEntries(entries);
    $pokeBody.querySelector(".poke-card-text").textContent = pokemonEntry.text;
    $pokeBody.querySelector(
        ".game-version"
    ).textContent = `Versión: ${pokemonEntry.gameVersion}`;
}

function getEntries(entries) {
    const pokemonEntry = { text: "", gameVersion: "" };

    if (entries) {
        const randomPos = Math.floor(Math.random() * entries.length);
        pokemonEntry.text = entries[randomPos].flavor_text;
        pokemonEntry.gameVersion = entries[randomPos].version.name;
    } else {
        pokemonEntry.text = "No hay descripción para este Pokemón";
    }

    return pokemonEntry;
}

// async function getAllPokemons() {
//     const response = await fetch(
//         "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0"
//     );
//     const allPokemons = await response.json();
//     const data = { pokemons: [], page: 0, index: 0 };
//     getNextPagination(allPokemons, data);
//     getNextPagination(allPokemons, data);
//     getPreviousPagination(allPokemons, data);
//     return allPokemons;
// }

// getAllPokemons();

// function getNextPagination(allPokemons, data) {
//     const TOTAL_PAGES = 20;
//     debugger;
//     const index = data.index;
//     data.pokemons = [];
//     let count = 0;
//     for (let i = index; count < TOTAL_PAGES; i++) {
//         count++;
//         const pokemon = allPokemons.results[i];
//         data.pokemons.push(pokemon);
//     }
//     data.page++;
//     data.index += TOTAL_PAGES;
//     console.log(data);
// }

// function getPreviousPagination(allPokemons, data) {
//     const TOTAL_PAGES = 20;
//     debugger;
//     const index = data.index - TOTAL_PAGES * 2;
//     data.pokemons = [];
//     let count = 0;
//     for (let i = index; count < TOTAL_PAGES; i++) {
//         count++;
//         const pokemon = allPokemons.results[i];
//         data.pokemons.push(pokemon);
//     }
//     data.page--;
//     data.index = index;
//     debugger;
//     console.log(data);
// }
