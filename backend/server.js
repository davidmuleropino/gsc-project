// Import necessary modules
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const pagesByRegion = require('./pageData'); // Import pages by region

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CALLBACK_URL = 'http://localhost:3001/auth/google/callback';

passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Route to initiate Google OAuth2 login
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/webmasters.readonly']
}));

// Route to handle the OAuth2 callback
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('http://localhost:3000');
});

// Route to check authentication status
app.get('/auth/google/status', (req, res) => {
    res.json({ isAuthenticated: req.isAuthenticated() });
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
}

// Route to fetch data from Google Search Console (requires authentication)
app.post('/api/fetchData', isAuthenticated, async (req, res) => {
    const { region, startDate, endDate } = req.body;
    const siteURL = region === "gx" ? "www.casinos.com" : `www.casinos.com/${region}`;
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: req.user.accessToken });

    const searchConsole = google.webmasters({ version: 'v3', auth: oauth2Client });
    let results = [];

    try {
        const pages = pagesByRegion[region] || []; // Default to an empty array if region not found
        if (pages.length === 0) {
            console.log(`No pages defined for region: ${region}`);
            return res.status(404).json({ message: `No pages found for region: ${region}` });
        }

        for (const page of pages) {
            const response = await searchConsole.searchanalytics.query({
                siteUrl: `https://${siteURL}`,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['query'],
                    dimensionFilterGroups: [{
                        filters: [{
                            dimension: 'page',
                            operator: 'equals',
                            expression: page
                        }]
                    }],
                    rowLimit: 3,
                    orderBy: [
                        { fieldName: 'clicks', sortOrder: 'DESCENDING' },
                        { fieldName: 'impressions', sortOrder: 'DESCENDING' }
                    ]
                }
            });

            if (Array.isArray(response.data.rows)) {
                response.data.rows.forEach(row => {
                    results.push({
                        date: startDate,
                        page,
                        query: row.keys[0],
                        clicks: row.clicks,
                        impressions: row.impressions,
                        ctr: row.ctr,
                        position: row.position
                    });
                });
            } else {
                console.log(`No data found for page: ${page} on ${startDate} to ${endDate}`);
            }
        }
        res.json(results);
    } catch (error) {
        console.error("Error in fetchData:", error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
});

// Route to get all pages by region
app.get('/api/getPages', isAuthenticated, (req, res) => {
    res.json(pagesByRegion);
});

// Route to update a specific page URL by region and index
app.post('/api/updatePage', isAuthenticated, (req, res) => {
    const { region, index, url } = req.body;

    // Debug logging
    console.log(`Updating page for region: ${region}, index: ${index}, new URL: ${url}`);
    console.log('Current pages for region:', pagesByRegion[region]);

    // Check if the region and index are valid
    if (!pagesByRegion[region]) {
        console.log("Region not found:", region);
        return res.status(400).json({ message: "Invalid region" });
    }
    
    if (pagesByRegion[region][index] === undefined) {
        console.log("Invalid page index:", index);
        return res.status(400).json({ message: "Invalid page index" });
    }

    // Update the URL
    pagesByRegion[region][index] = url;
    res.json({ message: "Page updated successfully", updatedPage: url });
});


// Route to update multiple pages at once for a given region
app.post('/api/updatePages', isAuthenticated, (req, res) => {
    const { region, pages } = req.body;
    
    if (!pagesByRegion[region]) {
        return res.status(400).json({ message: "Region not found" });
    }

    // Update pages for the specified region
    pagesByRegion[region] = pages;
    res.json({ message: "Pages updated successfully", updatedPages: pagesByRegion[region] });
});

app.listen(3001, () => {
    console.log("Backend server is running on port 3001");
});
