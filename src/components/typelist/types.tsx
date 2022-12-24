import './types.css';
import { POKEMON_TYPES_URL } from '../../api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Pokemon {
    pokemon: {
        name: String;
        url: String;
    }
}
interface PokemonTypes {
        name: String,
        url: String,
}
const Types = () => {

    if(!JSON.parse(localStorage.getItem("catchedPokemons") || '[]')){
        localStorage.setItem("catchedPokemons", JSON.stringify([]));
    }
    
    const [options, setOptions] = useState<PokemonTypes[]>([{name: '', url: ''}]);
    const [selected, setSelected] = useState();
    const [isWaiting, setIsWaiting] = useState(false);
    const [currentPokemons, setCurrentPokemons] = useState([]);
    const [isChecked, setChecked] = useState(false);
    const setOpt = localStorage.getItem("options");
    const setCurrPoke = localStorage.getItem("currPokemons");
    const catchedPokemons = JSON.parse(localStorage.getItem("catchedPokemons") || '[]');

    useEffect(() => {
        if(setOpt){
            setOptions(JSON.parse(setOpt));
        }
        if(setCurrPoke){
            setCurrentPokemons(JSON.parse(setCurrPoke));
        }
    },[setCurrPoke, setOpt])


    useEffect(() => {
        if(!localStorage.getItem("options")){
            setIsWaiting(true);
            const getTypes = async () => {
                try{
                    const res = await fetch(POKEMON_TYPES_URL);
                    if(!res.ok) {
                        throw new Error('An error occured.');
                    }
                    const types = await res.json();
                    setOptions(types.results);
                    localStorage.setItem("options", JSON.stringify(types.results));
                }catch(error) {
                    console.log(error);
                }finally {
                    setIsWaiting(false);
                }
            }
            setTimeout(() => {
                (async () => await getTypes())();
            }, 2000)}
    }, [])

    useEffect(() => {
        if(selected){
            setIsWaiting(true);
        const getSelectedPokemons = async () => {
            try{
                const res = await fetch(selected);
                if(!res.ok) {
                    throw new Error('An error occured.');
                }
                const sel = await res.json();
                setCurrentPokemons(sel.pokemon);
                localStorage.setItem("currPokemons", JSON.stringify(sel.pokemon));
            }catch(error) {
                console.log(error);
            }finally {
                setIsWaiting(false);
            }
        }
        setTimeout(() => {
            (async () => await getSelectedPokemons())();
        }, 2000)}
    }, [selected])

    const setSel = (e: any) => {
        setSelected(e.target.value);
    }

    const handleInputChange = (e: any) => {
        if(e.onkeydown === 8){
            resetInput();
        }
        setCurrentPokemons((current) => 
        current.filter((poke: Pokemon) => poke.pokemon.name.includes(e.target.value)));
    }

    const resetInput = () => {
        if(setCurrPoke){
            setCurrentPokemons(JSON.parse(setCurrPoke));
        }
        const inp = document.getElementById("searchInput") as HTMLInputElement;
        inp.value= "";
    }

    const detectDelete = (e: any) => {
        if(e.key === "Backspace"){
            resetInput();
        }
    }

    const handleCheck = (e: any) => {
        setChecked(e.target.checked);
    }
    return (
        <div className="Types">
            {isWaiting && 
            <div className="loader"><p>Loading...</p></div>}

            {!isWaiting &&
            <div className='listDiv'>
                <h2>Poke app</h2>
                
                <select id="typeSelect" key={'sel'} value={selected} onChange={setSel}>
                    <option defaultValue={''} key={'type'} hidden>Select type!</option>
                    {options.map( ( {name, url}: any ) => {
                    return(
                        <option key={`${url}`} value={url}>{name}</option>
                        )
                })}
                </select>
            </div>}
            
            {!isWaiting && currentPokemons && 
                    <div className="searchDiv">
                        <div className="searchLabel">
                            <label htmlFor="pokeSearch">Find your pokemon!</label>
                        </div>
                        <div className="searchNames">
                            <input name="pokeSearch" type="text" id="searchInput" placeholder='Search here...' onChange={handleInputChange} onKeyDown={detectDelete}/>
                            <button id="searchButton" onClick={resetInput}>Reset</button>
                        </div>
                        <div className="searchCatched">
                            <input name="catchedCheck" type="checkbox" id="catchedCheck" onChange={handleCheck} />
                            <p>Show only catched</p>
                        </div>
                    </div>}
                {!isWaiting && currentPokemons.map( ( {pokemon}: any ) => {
                    if(!isChecked){
                        if(!catchedPokemons.includes(pokemon.name)){
                            return(
                                <div className='singlePokemon' key={`${pokemon.name}`}>
                                <Link to={`/profile/${pokemon.name}`} defaultValue={`${pokemon.name}`}>
                                    {pokemon.name}
                                </Link>
                                </div>
                                )
                        }
                        return(
                            <div className='singlePokemon singleCatchedPokemon' key={`${pokemon.name}`}>
                            <Link to={`/profile/${pokemon.name}`} defaultValue={`${pokemon.name}`}>
                                {pokemon.name}
                            </Link>
                            </div>
                        )
                    }
                    else{
                        if(catchedPokemons.includes(pokemon.name)){
                            return(
                                <div className='singlePokemon singleCatchedPokemon' key={`${pokemon.name}`}>
                                <Link to={`/profile/${pokemon.name}`} defaultValue={`${pokemon.name}`}>
                                    {pokemon.name}
                                </Link>
                                </div>
                            )}
                        return true;
                        }
                    })
                }   
        </div>
        );
}

export default Types;