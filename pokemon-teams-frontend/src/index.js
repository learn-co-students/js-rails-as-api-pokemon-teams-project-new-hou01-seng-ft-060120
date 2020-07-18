const BASE_URL = "http://localhost:3000"
const TRAINERS_URL = `${BASE_URL}/trainers`
const POKEMONS_URL = `${BASE_URL}/pokemons`

// Wait for page to load
document.addEventListener("DOMContentLoaded", () => {
    fetch(TRAINERS_URL)
        .then(resp => resp.json())
        .then(json => {
            createTrainerCards(json)
            document.addEventListener("click", (e) => {
                if (e.target.matches("button.release")) {
                    let pokemon = e.target.getAttribute("data-pokemon-id");
                    let liElement = e.target.parentNode;
                    releasePokemon(pokemon, liElement);
                }
            })
        })
})

// Creates trainer cards
function createTrainerCards(trainers) {
    const main = document.getElementById("trainers-collection")
    trainers.forEach(trainer => {
        const card = document.createElement("div");
        card.className = "card";
        card.setAttribute("data-id", `${trainer.id}`);

        let name = document.createElement('p');
        name.innerText = trainer.name;
        card.appendChild(name);

        createAddButton(trainer, card)
        createPokemonList(trainer, card)
        main.appendChild(card)
    })
}

// Creates add button and add back to trainer card
function createAddButton(trainer, card) {
    let button = document.createElement('button');
    button.setAttribute("data-trainer-id", `${trainer.id}`)
    button.innerText = "Add Pokemon"
    button.addEventListener("click", () => {
        fetch(TRAINERS_URL)
            .then(resp => resp.json())
            .then(json => {
                let updatedTrainer = json[trainer.id - 1];
                if (updatedTrainer.pokemons.length < 6) {
                    addNewPokemon(updatedTrainer);
                } else if (updatedTrainer.pokemons.length == 6) {
                    alert("Trainer has 6 Pokemons, can't add anymore!")
                }
            })
    })
    card.appendChild(button)
}

// Creates li pokemons and add to ul then add ul back to trainer card
function createPokemonList(trainer, card) {
    let trainerUl = document.createElement('ul');
    trainer.pokemons.forEach( pokemon => {
        let pokemonLi = document.createElement('li');
        pokemonLi.innerHTML = `
            ${pokemon.nickname} (${pokemon.species})
            <button class="release" data-pokemon-id="${pokemon.id}">Release</button>
        `
        trainerUl.appendChild(pokemonLi)
    })
    card.appendChild(trainerUl)
}

// When add Pokemon button cliked, add new Pokemon (To Backend)
function addNewPokemon(trainer) {
    const pokemon = {
        "trainer_id": trainer.id
    }

    fetch(POKEMONS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(pokemon),
    }).then(resp => resp.json()).then(json => displayNewPokemon(json));
}

// Optimistic rendering of new added pokemon
function displayNewPokemon(pokemon) {
    let ul = document.querySelector(`[data-id="${pokemon.trainer_id}"] > ul`);
    let li = document.createElement('li');
    li.innerHTML = `
        ${pokemon.nickname} (${pokemon.species})
        <button class="release" data-pokemon-id="${pokemon.id}">Release</button>
    `
    ul.appendChild(li)
}

// Release pokemon (front and back)
function releasePokemon(pokemon, liElement) {
    liElement.remove();
    fetch(`${POKEMONS_URL}/${pokemon}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    })
}
