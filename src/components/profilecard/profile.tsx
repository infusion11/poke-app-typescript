import './profile.css';
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { POKEMON_PROFILE_URL } from "../../api";

interface PokemonProfile {
    name: String;
    weight: String;
    height: String;
    abilities: [{
        is_hidden: Boolean;
        ability: {
            name: String;
        }
    }]
    sprites: {
        other: {
            dream_world: {
                front_default: String;
            }
        }
    }
}

const Profile = () => {
    const {name} = useParams();
    const [isWaiting, setIsWaiting] = useState(false);
    const [pokeProfile, setProfile] = useState<PokemonProfile>(
        {name: '',
        weight: '',
        height: '',
        abilities: [{is_hidden: false, ability: { name: ''}}],
        sprites: {other:{dream_world:{front_default: ''}}}});
    const [isCatched, setCatched] = useState(false);
    let catchedPokemons = JSON.parse(localStorage.getItem("catchedPokemons") || '[]');

    useEffect(() => {
        if(catchedPokemons){
            for(let n = 0; n < catchedPokemons.length; n++){
                if(name === catchedPokemons[n] ){
                    setCatched(true);
                }
            }
        }
    }, [name, catchedPokemons])

    useEffect(() => {
        setIsWaiting(true);
        const getPokemon = async () => {
            try{
                const res = await fetch(POKEMON_PROFILE_URL+name);
                if(!res.ok) {
                    throw new Error('An error occured.');
                }
                const profile = await res.json();
                setProfile(profile);
            }catch(error) {
                console.log(error);
            }finally {
                setIsWaiting(false);
            }
        }
        setTimeout(() => {
            (async () => await getPokemon())();
        }, 2000)
    }, [name])

    const handleCatch = () => {
        catchedPokemons.push(pokeProfile.name);
        localStorage.setItem("catchedPokemons", JSON.stringify(catchedPokemons));
        setCatched(true);
    }

    const handleRelease = () => {
        for(let n = 0; n < catchedPokemons.length; n++){
            if(name === catchedPokemons[n]){
                catchedPokemons.splice(n,1);
                localStorage.setItem("catchedPokemons", JSON.stringify(catchedPokemons));
                setCatched(false);
            }
        }
    }

    const renderButton = () => {
        if(isCatched){
            return (
                <button id="catchRelease" onClick={handleRelease}>Release</button>
            );
        }
        else{
            return (
                <button id="catchRelease" onClick={handleCatch}>Catch</button>
            );
        }
    }

    return (
        <div className="Profile">
            {isWaiting &&
            <div className="loader"><p>Loading...</p></div>}
            {!isWaiting && pokeProfile &&
            <div className="profileContainer">
                <div className="prevButton">
                    <Link to="/">Back to the list</Link>
                </div>
                <h2>Look who arrived!</h2>
                <div className="profileInfo">
                    <div className='profileImage'>
                        <img src={pokeProfile.sprites.other.dream_world.front_default.toString()} alt={pokeProfile.name.toString()} />
                    </div>
                    <div className='profileName'>
                        <p>NAME</p>
                        <p>{pokeProfile.name}</p>
                    </div>
                    <div className='profileWeight'>
                        <p>WEIGHT</p>
                        <p>{pokeProfile.weight}</p>
                    </div>
                        <div className='profileHeight'>
                        <p>HEIGHT</p>
                        <p>{pokeProfile.height}</p>
                    </div>
                        <div className='profileAbilities'>
                        <p>ABILITIES</p>
                    {pokeProfile.abilities.map( ( { is_hidden, ability}: any ) => {
                        return (
                            is_hidden === false && <p key={`${ability.name}`}>{ability.name}</p>
                            )
                    })}
                    </div>
                    {renderButton()}
                </div>
            </div>}
            
        </div>
    );
}

export default Profile;