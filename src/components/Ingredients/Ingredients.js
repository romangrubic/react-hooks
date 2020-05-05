import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const ingredientReducer = (currentIngredients, action) => {
    switch (action.type) {
        case 'SET':
            return action.ingredient;
        case 'ADD':
            return [...currentIngredients, action.ingredient];
        case 'DELETE':
            return currentIngredients.filter(ing => ing.id !== action.id);
        default:
            throw new Error('Should not get here!');
    }
};

const httpReducer = (httpState, action) => {
    switch (action.type) {
        case 'SEND':
            return { loading: true, error: null };
        case 'RESPONSE':
            return { ...httpState, loading: false };
        case 'ERROR':
            return { loading: false, error: action.errorMessage };
        case 'CLEAR':
            return { ...httpState, error: null }
        default:
            throw new Error('Should not get here!');
    }
}

const Ingredients = () => {
    const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
    const [httpState, dispatchHttp] = useReducer(httpReducer, { loading: false, error: null });
    // const [userIngredients, setUserIngredients] = useState([]);
    // const [isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState();

    // useEffect renders every cycle after everything finished
    // with an [] at the end, it is like component did mount.

    useEffect(() => {
        console.log('rendering ingredients', userIngredients);
    }, [userIngredients])

    const filterIngredientsHandler = useCallback((filteredIngredients) => {
        // setUserIngredients(filteredIngredients);
        dispatch({ type: 'SET', ingredient: filteredIngredients })
    }, []);

    const addIngredientHandler = useCallback(ingredient => {
        dispatchHttp({ type: 'SEND' });
        fetch('https://react-hook-99ae7.firebaseio.com/ingredients.json', {
            method: 'POST',
            body: JSON.stringify(ingredient),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            dispatchHttp({ type: 'RESPONSE' });
            return response.json();
        }).then(responseData => {
            // setUserIngredients(prevIngredients => [...prevIngredients,
            // { id: responseData.name, ...ingredient }])
            dispatch({ type: 'ADD', ingredient: { id: responseData.name, ...ingredient } })
        });
    }, [])
    const removeIngredientHandler = useCallback(ingredientId => {
        dispatchHttp({ type: 'SEND' });
        fetch(`https://react-hook-99ae7.firebaseio.com/ingredients/${ingredientId}.json`, {
            method: 'DELETE',
        }).then(response => {
            dispatchHttp({ type: 'RESPONSE' });
            // setUserIngredients(prevIngredients =>
            //     prevIngredients.filter((ingredient) => ingredient.id !== ingredientId))
            dispatch({ type: 'DELETE', id: ingredientId })
        }).catch(err => {
            dispatchHttp({ type: 'ERROR', errorMessage: 'Something went wrong!' });
        })
    }, [])

    const clearError = useCallback(() => {
        dispatchHttp({ type: 'CLEAR' });
    }, []);

    const ingredientList = useMemo(() => {
        return <IngredientList 
        ingredients={ userIngredients } 
        onRemoveItem={ (ingredientId) => { removeIngredientHandler(ingredientId) } } />
    }, [userIngredients, removeIngredientHandler])

    return (
        <div className="App">
            { httpState.error && <ErrorModal onClose={ clearError }>{ httpState.error }</ErrorModal> }
            <IngredientForm
                onAddIngredient={ addIngredientHandler }
                loading={ httpState.loading } />
            <section>
                <Search onLoadIngredients={ filterIngredientsHandler } />
            </section>
            {ingredientList}
        </div>
    );
}

export default Ingredients;
