import { useReducer, useCallback } from 'react';

const httpReducer = (httpState, action) => {
    switch (action.type) {
        case 'SEND':
            return { loading: true, error: null, data: null };
        case 'RESPONSE':
            return { ...httpState, loading: false, data: action.responseData };
        case 'ERROR':
            return { loading: false, error: action.errorMessage };
        case 'CLEAR':
            return { ...httpState, error: null }
        default:
            throw new Error('Should not get here!');
    }
}


const useHttp = () => {
    const [httpState, dispatchHttp] = useReducer(httpReducer, {
        loading: false,
        error: null,
        data: null
    });

    const sendRequest = useCallback((url, method, body) => {
        dispatchHttp({ type: 'SEND' })
        fetch(
            url,
            {
                method: method,
                body: body,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                return response.json();
            })
            .then(responseData => {
                dispatchHttp({ type: 'RESPONSE', resposeData: responseData });
            })
            .catch(err => {
                dispatchHttp({ type: 'ERROR', errorMessage: 'Something went wrong!' });
            });
    }, []);
    return {
        isLoading: httpState.loading,
        dta: httpState.data,
        error: httpState.error,
        sendRequest: sendRequest
    };
}

export default useHttp;