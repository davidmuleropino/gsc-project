// frontend/src/UpdatePagesForm.js
import React, { useState } from 'react';
import axios from 'axios';

function UpdatePagesForm() {
    const [region, setRegion] = useState('');
    const [pages, setPages] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const pageArray = pages.split(',').map(page => page.trim());

        try {
            const response = await axios.post(
                'http://localhost:3001/api/updatePages',
                { region, pages: pageArray },
                { withCredentials: true }
            );
            setMessage(response.data.message);
        } catch (error) {
            setMessage("Error updating pages.");
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Update Pages for Region</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Region:
                    <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} />
                </label>
                <br />
                <label>
                    Pages (comma-separated):
                    <input type="text" value={pages} onChange={(e) => setPages(e.target.value)} />
                </label>
                <br />
                <button type="submit">Update Pages</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default UpdatePagesForm;
