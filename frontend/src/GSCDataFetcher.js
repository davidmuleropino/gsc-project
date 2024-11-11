// frontend/src/GSCDataFetcher.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

function GSCDataFetcher({ isAuthenticated }) {
    const [regions, setRegions] = useState([]); // Store available regions
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [results, setResults] = useState([]);

    // Fetch available region keys from the backend with credentials
    useEffect(() => {
        axios.get('http://localhost:3001/api/getPages?keysOnly=true', { withCredentials: true })
            .then(response => setRegions(response.data))
            .catch(error => console.error("Error fetching regions:", error));
    }, []);

    const handleRegionChange = (region) => {
        setSelectedRegions(prevSelected =>
            prevSelected.includes(region)
                ? prevSelected.filter(r => r !== region) // Uncheck
                : [...prevSelected, region] // Check
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert("Please log in first.");
            return;
        }

        if (selectedRegions.length === 0) {
            alert("Please select at least one region.");
            return;
        }

        try {
            let allResults = [];

            for (const region of selectedRegions) {
                const response = await axios.post(
                    'http://localhost:3001/api/fetchData',
                    { region, startDate, endDate },
                    { withCredentials: true }
                );
                allResults = [...allResults, ...response.data.map(result => ({ ...result, region }))]; // Add region info to each result
            }

            setResults(allResults);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleExportCSV = () => {
        const csv = Papa.unparse(results);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `GSC_Results_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <h2>Google Search Console Data Fetcher</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <h3>Regions</h3>
                    {regions.map((region) => (
                        <label key={region} style={{ display: 'block' }}>
                            <input
                                type="checkbox"
                                checked={selectedRegions.includes(region)}
                                onChange={() => handleRegionChange(region)}
                            />
                            {region.toUpperCase()}
                        </label>
                    ))}
                </div>
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
                <button onClick={handleExportCSV} disabled={results.length === 0}>Export to CSV</button>
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
                            <th>Region</th>
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
                                <td>{result.region}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GSCDataFetcher;
