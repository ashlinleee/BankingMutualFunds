const express = require('express');
const axios = require('axios');
const router = express.Router();

const MF_API_URL = 'https://mfdata.in/api/v1';

const sendUpstreamError = (res, error, fallbackMessage) => {
  if (error.response && error.response.data) {
    res.status(error.response.status || 500).json(error.response.data);
    return;
  }
  res.status(500).json({ status: 'error', detail: fallbackMessage });
};

// List all schemes
router.get('/schemes', async (req, res) => {
  try {
    const response = await axios.get(`${MF_API_URL}/schemes`);
    res.json(response.data);
  } catch (error) {
    sendUpstreamError(res, error, 'Error fetching schemes');
  }
});

// Search schemes
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`${MF_API_URL}/search`, { params: { q } });
    res.json(response.data);
  } catch (error) {
    sendUpstreamError(res, error, 'Error searching schemes');
  }
});

// List AMCs (MF houses)
router.get('/amcs', async (req, res) => {
  try {
    const response = await axios.get(`${MF_API_URL}/amcs`);
    res.json(response.data);
  } catch (error) {
    sendUpstreamError(res, error, 'Error fetching AMCs');
  }
});

// Get AMC details (includes schemes)
router.get('/amcs/:amcSlug', async (req, res) => {
  try {
    const { amcSlug } = req.params;
    const response = await axios.get(`${MF_API_URL}/amcs/${amcSlug}`);
    res.json(response.data);
  } catch (error) {
    sendUpstreamError(res, error, 'Error fetching AMC details');
  }
});

// Get scheme details
router.get('/schemes/:schemeCode', async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const response = await axios.get(`${MF_API_URL}/schemes/${schemeCode}`);
    res.json(response.data);
  } catch (error) {
    sendUpstreamError(res, error, 'Error fetching scheme details');
  }
});

// Get latest NAV
router.get('/schemes/:schemeCode/nav', async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const response = await axios.get(`${MF_API_URL}/schemes/${schemeCode}/nav`);
    res.json(response.data);
  } catch (error) {
    sendUpstreamError(res, error, 'Error fetching NAV');
  }
});

module.exports = router;
