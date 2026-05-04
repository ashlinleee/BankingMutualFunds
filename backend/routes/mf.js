const express = require('express');
const axios = require('axios');
const router = express.Router();

const MF_API_URL = 'https://api.mfapi.in/mf';

// Get all mutual funds
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(MF_API_URL);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mutual funds' });
  }
});

// Get details of a specific mutual fund
router.get('/:schemeCode', async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const response = await axios.get(`${MF_API_URL}/${schemeCode}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mutual fund details' });
  }
});

// Get NAV for a specific mutual fund
router.get('/nav/:schemeCode', async (req, res) => {
    try {
      const { schemeCode } = req.params;
      const response = await axios.get(`${MF_API_URL}/${schemeCode}`);
      res.json({ nav: response.data.data[0].nav });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching NAV' });
    }
  });

module.exports = router;
