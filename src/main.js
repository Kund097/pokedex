//Construir una pokedex https://pokeapi.co/

//Consultar documentación https://pokeapi.co/docs/v2.html#
//Listar pokemones, y poder cambiar de página
//Ver detalles de 1 pokemon, incluyendo al menos 1 foto
// const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
addEventListener("load", insertElements());
async function getPokemons(URL) {
    try {
        const response = await fetch(URL);
        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error(
            "Error al realizar la petición o procesar los datos: ",
            error
        );
    }
}

async function insertElements(URL = "https://pokeapi.co/api/v2/pokemon") {
    const pokemonApi = await getPokemons(URL);
    const results = pokemonApi.results;
    const $tBody = document.querySelector(".table-pokemons");
    results.forEach(({ name, url }) => {
        console.log(name, url);
        const POKE_ID = getPokemonId(url);
        const { $tr, $thName, $thId } = createTableElements();

        $tBody.appendChild($tr);
        $thName.textContent = name;
        $thId.textContent = POKE_ID;
        $tr.id = POKE_ID;
        $tr.appendChild($thName);
        $tr.appendChild($thId);
    });
    insertUrlNextList(pokemonApi);
    insertUrlPreviousList(pokemonApi);
    const $elements = createTableElements();
    console.log($elements);
}

function createTableElements() {
    const $tr = document.createElement("tr");
    const $thName = document.createElement("th");
    const $thId = document.createElement("th");
    $tr.className = "table-active";
    return { $tr, $thName, $thId };
}

function getPokemonId(URL) {
    const regEx = new RegExp(/(\d+)\/?$/);
    const id = URL.match(regEx)[1];
    return id;
}

function insertUrlNextList(currentApi) {
    if (currentApi.next) {
        const $anchorElement = document.querySelector(".next-page");
        $anchorElement.setAttribute("target", `${currentApi.next}`);
        console.log($anchorElement.getAttribute("target"));
    }
}

function insertUrlPreviousList(currentApi) {
    if (currentApi.previous) {
        const $anchorElement = document.querySelector(".previous-page");
        $anchorElement.setAttribute("target", `${currentApi.previous}`);
        console.log($anchorElement.getAttribute("target"));
    }
}

document.querySelectorAll(".page-btn").forEach(() => {
    addEventListener("click", handlePagination);
});
function handlePagination(event) {
    event.preventDefault();
    console.log(event.target);
    const $anchorElement = event.target;
    const value = $anchorElement.id || null;
    const url = $anchorElement.target;
    const buttonFunctions = {
        next: nextList,
        previous: previousList,
        null: () => {},
    };
    buttonFunctions[value](url);
}

function nextList(nextUrl) {
    // debugger;
    console.log("estoy en next", nextUrl);
    removeElements();
    insertElements(nextUrl);
}

function previousList(previousUrl) {
    console.log("estoy en previo");
    removeElements();
    insertElements(previousUrl);
}

function removeElements() {
    const $trTable = document.querySelectorAll(".table-active");

    $trTable.forEach((element) => {
        element.remove();
    });
}
