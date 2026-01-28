const pokemon_sec = document.querySelector(".pokemon-sec");
const loadMore = document.querySelector(".load-more");
let numOfPoke = 0;
const maxPokemon = 1025;
const search_poke = document.querySelector("#poke-search");
const pokédex = document.querySelector(".pokédex");

pokédex.addEventListener("click", () => {
    window.location.href = "index.html";
    return;
});

const load_all_poke = async (URL) => {

    try{
        let res = await fetch(URL);
        let data = await res.json();
        console.log(data);
        let i = 0;
        allPokemonData = data.results.map(p => {
            i++;
            return {
                name: p.name,
                id: i
            };
        });
        // console.log(allPokemonData);
    } catch (err) {
        console.error("Failed to load list.", err);
    }
}

const pokemon = async (poke_name,poke_url,new_poke) => {
    numOfPoke++;

    try{
        let res = await fetch(poke_url);
        let data = await res.json();
        // console.log(poke_types);
        // console.log(data);

        let formattedId = data.id.toString().padStart(4,'0');

        new_poke.innerHTML = `
            <img src="${data.sprites.other['official-artwork'].front_default}" alt="${poke_name}" class="poke-img"/>
            <div class="poke-detail">
                <span class="poke-num">#${formattedId}</span>
                <div class="name-poke">${poke_name}</div>
                <div class="type-poke">
                    ${data.types.map(t => `<div class="box ${t.type.name}">${t.type.name}</div>`).join('')}
                </div>
            </div>
            `;

        new_poke.addEventListener("click",() => {

            new_poke.classList.toggle("poke-border");
            window.location.href = `details.html?id=${data.id}`;
        });

    } catch (err) {
        console.error("Failed to load list", err);
    }
}

const load_more_poke = async (URL) => {
    
    try{
        let res = await fetch(URL);
        let data = await res.json();
        let len = data.results.length;
        // console.log(data);
        
        for(let i = 0;i < len;i++){

            let new_poke = document.createElement("div");
            new_poke.classList.add("pokemon");
            pokemon_sec.appendChild(new_poke);

            pokemon(data.results[i].name , data.results[i].url, new_poke);
        }

    } catch (err) {
        console.error("Failed to load list", err);
    }
}

const displaySearchResult = (filterPoke) => {
    
    pokemon_sec.innerHTML = "";

    loadMore.style.display = "none";

    if (filterPoke.length === 0) {
        pokemon_sec.innerHTML = `<div class="not-found">No Pokémon Found 😢</div>`;
        return;
    }

    const newCards = filterPoke.map(pokemon => {
        const imgURL = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
        const formattedId = pokemon.id.toString().padStart(4,'0');

        return `
        <div class="pokemon" onclick="window.location.href='details.html?id=${pokemon.id}'">
            <img src="${imgURL}" alt="${pokemon.name}" class="poke-img">
            <div class="poke-detail">
                <span class="poke-num">#${formattedId}</span>
                <div class="name-poke">${pokemon.name}</div>
            </div>
        </div>
        `;
    }).join("");

    pokemon_sec.innerHTML = newCards;
} 

window.addEventListener("load", () => {
    const URL1 = "https://pokeapi.co/api/v2/pokemon?limit=12&offset=0";
    load_more_poke(URL1);
    const URL2 = "https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0";
    load_all_poke(URL2);
});

loadMore.addEventListener("click",() => {
    // console.log(numOfPoke);
    if(numOfPoke < 1014){
        const URL = `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${numOfPoke}"`;
        load_more_poke(URL);
    }
    else if(numOfPoke < 1026){
        const URL = `https://pokeapi.co/api/v2/pokemon?limit=${1025 - numOfPoke}&offset=${numOfPoke}"`;
        load_more_poke(URL);
    }
});


search_poke.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    console.log(val);

    if (val === "") {
        pokemon_sec.innerHTML = "";
        loadMore.style.display = "block";
        numOfPoke = 0;
        
        const URL = "https://pokeapi.co/api/v2/pokemon?limit=12&offset=0";
        load_more_poke(URL);
        return;
    }

    const filterPokemon = allPokemonData.filter(pokemon => {
        return pokemon.name.includes(val) || pokemon.id.toString() === val;
    });

    displaySearchResult(filterPokemon);
});