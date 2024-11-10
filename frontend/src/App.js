// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GSCDataFetcher from './GSCDataFetcher';
import UpdatePagesForm from './UpdatePagesForm';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if the user is authenticated by calling the backend
        axios.get('http://localhost:3001/auth/google/status', { withCredentials: true })
            .then(response => {
                setIsAuthenticated(response.data.isAuthenticated);
            })
            .catch(error => {
                console.error("Error checking auth status:", error);
            });
    }, []);

    const handleLogin = () => {
        // Redirect to Google OAuth login
        window.location.href = 'http://localhost:3001/auth/google';
    };

    return (
        <div>
            <h1>Google Search Console Application</h1>
            {!isAuthenticated ? (
                <button onClick={handleLogin}>Login with Google</button>
            ) : (
                <>
                    <GSCDataFetcher isAuthenticated={isAuthenticated} />
                    <hr />
                    <UpdatePagesForm />
                </>
            )}
        </div>
    );
}

export default App;
