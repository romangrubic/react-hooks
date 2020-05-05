import React, { useState, useEffect } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';

const Ingredients = () => {
    const [userIngredients, setUserIngredients] = useState([])

    // useEffect renders every cycle after everything finished
    // with an [] at the end, it is like component did mount.
    useEffect(() => {
        fetch('https://react-hook-99ae7.firebaseio.com/ingredients.json').then(response => response.json()).then(responseData => {
            const loadedIngredients = [];
            for (const key in responseData) {
                loadedIngredients.push({
                    id: key,
                    title: responseData[key].title,
                    amount: responseData[key].amount
                });
            }
            setUserIngredients(loadedIngredients);
        });
    }, []);

    useEffect(() => {
        console.log('rendering ingredients', userIngredients);
    })

    const filterIngredientsHandler = (filteredIngredients) => {
        setUserIngredients(filteredIngredients);
    }

    const addIngredientHandler = ingredient => {
        fetch('https://react-hook-99ae7.firebaseio.com/ingredients.json', {
            method: 'POST',
            body: JSON.stringify(ingredient),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            return response.json();
        }).then(responseData => {
            setUserIngredients(prevIngredients => [...prevIngredients,
            { id: responseData.name, ...ingredient }])
        });
    }
    const removeIngredientHandler = ingredientId => {
        setUserIngredients(prevIngredients =>
            prevIngredients.filter((ingredient) => ingredient.id !== ingredientId))
    }
    return (
        <div className="App">
            <IngredientForm onAddIngredient={ addIngredientHandler } />

            <section>
                <Search onLoadIngredients={filterIngredientsHandler}/>
                <IngredientList ingredients={ userIngredients } onRemoveItem={ (ingredientId) => { removeIngredientHandler(ingredientId) } } />
            </section>
        </div>
    );
}

export default Ingredients;
