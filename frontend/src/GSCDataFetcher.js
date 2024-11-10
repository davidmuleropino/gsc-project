// frontend/src/GSCDataFetcher.js
import React, { useState } from 'react';
import axios from 'axios';

function GSCDataFetcher({ isAuthenticated }) {
    const [region, setRegion] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [results, setResults] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert("Please log in first.");
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:3001/api/fetchData',
                { region, startDate, endDate },
                { withCredentials: true }
            );
            setResults(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    return (
        <div>
            <h2>Google Search Console Data Fetcher</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Region:
                    <input 
                        type="text" 
                        value={region} 
                        onChange={(e) => setRegion(e.target.value)} 
                        placeholder="e.g., gx for global" // Add placeholder as a hint
                    />
                </label>
                <label>
                    Start Date:
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </label>
                <label>
                    End Date:
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </label>
                <button type="submit">Fetch Data</button>
            </form>
            <div>
                <h2>Results</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Page</th>
                            <th>Query</th>
                            <th>Clicks</th>
                            <th>Impressions</th>
                            <th>CTR</th>
                            <th>Position</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result, index) => (
                            <tr key={index}>
                                <td>{result.date}</td>
                                <td>{result.page}</td>
                                <td>{result.query}</td>
                                <td>{result.clicks}</td>
                                <td>{result.impressions}</td>
                                <td>{result.ctr}</td>
                                <td>{result.position}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GSCDataFetcher;
