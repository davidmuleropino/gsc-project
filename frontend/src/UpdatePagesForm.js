// frontend/src/UpdatePagesForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UpdatePagesForm() {
    const [pagesByRegion, setPagesByRegion] = useState({});
    const [message, setMessage] = useState('');

    // Load the pages from the server when the component mounts
    useEffect(() => {
        axios.get('http://localhost:3001/api/getPages', { withCredentials: true })
            .then(response => {
                setPagesByRegion(response.data);
            })
            .catch(error => {
                console.error("Error loading pages:", error);
            });
    }, []);

    // Handle changes to a specific URL in the input field
    const handlePageChange = (region, index, newUrl) => {
        setPagesByRegion(prev => ({
            ...prev,
            [region]: prev[region].map((url, i) => (i === index ? newUrl : url))
        }));
    };

    // Handle updating a specific page in the backend
    const handleUpdatePage = async (region, index) => {
        const updatedUrl = pagesByRegion[region][index];
        try {
            const response = await axios.post(
                'http://localhost:3001/api/updatePage',
                { region, index, url: updatedUrl },
                { withCredentials: true }
            );
            setMessage(response.data.message);
        } catch (error) {
            setMessage("Error updating page.");
            console.error("Error updating page:", error);
        }
    };

    // Add a new, empty page URL to the specified region
    const handleAddPage = (region) => {
        setPagesByRegion(prev => ({
            ...prev,
            [region]: [...(prev[region] || []), ''] // Add an empty string as a new row
        }));
    };

    return (
        <div>
            <h2>Update Pages for Each Region</h2>
            {Object.keys(pagesByRegion).map(region => (
                <div key={region}>
                    <h3>Region: {region}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>URL</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagesByRegion[region].map((url, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => handlePageChange(region, index, e.target.value)}
                                            maxLength="250" // Limit input to 250 characters
                                            style={{ width: '300px' }} // Adjust width for readability
                                        />
                                    </td>
                                    <td>
                                        <button onClick={() => handleUpdatePage(region, index)}>Update</button>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'right' }}>
                                    <button onClick={() => handleAddPage(region)}>Add</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
            {message && <p>{message}</p>}
        </div>
    );
}

export default UpdatePagesForm;
