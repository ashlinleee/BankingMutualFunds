const API_URL = 'http://localhost:3000/api/mf';

// DOM Elements
const mfSearch = document.getElementById('mf-search');
const exploreView = document.getElementById('explore-view');
const allFundsView = document.getElementById('all-funds-view');
const fundDetailView = document.getElementById('fund-detail-view');
const backToExploreBtn = document.getElementById('back-to-explore');
const backToExploreFromAllBtn = document.getElementById('back-to-explore-from-all');
const viewAllFundsLink = document.getElementById('view-all-funds-link');
const popularFundsGrid = document.getElementById('popular-funds-grid');
const allFundsGrid = document.getElementById('all-funds-grid');
const fundsStatus = document.getElementById('funds-status');
const fundsStatusAll = document.getElementById('funds-status-all');

// Details
const schemeName = document.getElementById('scheme-name');
const schemeNav = document.getElementById('scheme-nav');
const navDate = document.getElementById('nav-date');
const navLiveText = document.getElementById('nav-live-text');

// Invest Widget
const tabSip = document.getElementById('tab-sip');
const tabLumpsum = document.getElementById('tab-lumpsum');
const formSip = document.getElementById('form-sip');
const formLumpsum = document.getElementById('form-lumpsum');
const sipInvestBtn = document.getElementById('sip-invest-btn');
const lumpsumInvestBtn = document.getElementById('lumpsum-invest-btn');
const paymentStep = document.getElementById('payment-step');
const paymentSuccess = document.getElementById('payment-success');
const confirmPaymentBtn = document.getElementById('confirm-payment-btn');

let mutualFunds = [];
let filteredFunds = [];
let selectedScheme = null;

const getFundName = (fund) => fund.scheme_name || fund.schemeName || 'Unknown Fund';
const getFundCode = (fund) => fund.scheme_code || fund.schemeCode || '';
const setFundsStatus = (text) => {
    if (fundsStatus) fundsStatus.textContent = text;
    if (fundsStatusAll) fundsStatusAll.textContent = text;
};

// Initialization
const init = async () => {
    await fetchMutualFunds();
};

const fetchMutualFunds = async () => {
    setFundsStatus('Loading funds...');
    try {
        const response = await fetch(`${API_URL}/schemes`);
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        mutualFunds = list.slice(0, 50);
        filteredFunds = [...mutualFunds];
        renderFunds();
    } catch (error) {
        console.error('Error fetching mutual funds:', error);
        mutualFunds = [];
        filteredFunds = [];
        renderFunds();
        setFundsStatus('Unable to load funds from API. Check backend.');
    }
};

const renderFunds = () => {
    popularFundsGrid.innerHTML = '';
    allFundsGrid.innerHTML = '';
    
    const popular = filteredFunds.slice(0, 3);
    
    popular.forEach(fund => popularFundsGrid.appendChild(createFundCard(fund)));
    filteredFunds.forEach(fund => allFundsGrid.appendChild(createFundCard(fund)));

    if (!filteredFunds.length) {
        setFundsStatus('No funds found. Try a different search.');
        return;
    }
    setFundsStatus(`Showing ${filteredFunds.length} funds`);
};

const createFundCard = (fund) => {
    const card = document.createElement('div');
    card.classList.add('fund-card');
    const mockReturn = (Math.random() * 20 + 10).toFixed(2);
    const name = getFundName(fund);
    const code = getFundCode(fund);
    
    card.innerHTML = \`
        <div class="fund-name">${name}</div>
        <div class="fund-stats">
            <div>
                <span class="stat-label">1Y Return</span>
                <strong class="green-text">\${mockReturn}%</strong>
            </div>
            <div>
                <span class="stat-label">Scheme Code</span>
                <strong>${code || '--'}</strong>
            </div>
        </div>
    \`;
    card.addEventListener('click', () => openFundDetails(fund));
    return card;
};

// Search handling
mfSearch.addEventListener('input', (async (e) => {
    const term = e.target.value.trim();
    if (term.length > 2) {
        try {
            const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(term)}`);
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.data || []);
            filteredFunds = list.slice(0, 50);
        } catch {
             filteredFunds = mutualFunds.filter(fund => 
                getFundName(fund).toLowerCase().includes(term.toLowerCase()) ||
                getFundCode(fund).toString().includes(term)
            );
        }
    } else {
        filteredFunds = [...mutualFunds];
    }
    renderFunds();
}));

let navPollingInterval = null;

// View Navigation
const openFundDetails = async (fund) => {
    selectedScheme = fund;
    schemeName.textContent = getFundName(fund);
    schemeNav.textContent = 'Fetching...';
    if (navDate) navDate.textContent = '--';
    if (navLiveText) navLiveText.textContent = 'Connecting...';
    
    exploreView.classList.remove('active-view');
    allFundsView.classList.remove('active-view');
    fundDetailView.classList.add('active-view');
    
    // Reset widget
    paymentStep.style.display = 'none';
    paymentSuccess.style.display = 'none';
    formSip.style.display = 'block';
    formLumpsum.style.display = 'none';
    tabSip.classList.add('active');
    tabLumpsum.classList.remove('active');

    const schemeCode = getFundCode(fund);
    let navPollingTicks = 0;
    const fetchNav = async () => {
        try {
            if (!schemeCode) {
                schemeNav.textContent = '₹--';
                if (navLiveText) navLiveText.textContent = 'Scheme code unavailable';
                return;
            }
            const response = await fetch(`${API_URL}/schemes/${schemeCode}/nav`);
            if (response.ok) {
                const data = await response.json();
                const navValue = data?.data?.nav || data?.nav;
                const navDateValue = data?.data?.date || data?.date;
                schemeNav.textContent = navValue ? `₹${parseFloat(navValue).toFixed(2)}` : '₹--';
                if (navDate && navDateValue) navDate.textContent = navDateValue;
                schemeNav.classList.add('updated-highlight');
                setTimeout(() => schemeNav.classList.remove('updated-highlight'), 500);
                navPollingTicks += 1;
                if (navLiveText) navLiveText.textContent = `Live updates (${navPollingTicks})`;
            } else {
                schemeNav.textContent = '₹--';
                if (navLiveText) navLiveText.textContent = 'Live updates unavailable';
            }
        } catch {
            schemeNav.textContent = '₹--';
            if (navLiveText) navLiveText.textContent = 'Live updates unavailable';
        }
    };
    
    await fetchNav();
    if (navPollingInterval) clearInterval(navPollingInterval);
    navPollingInterval = setInterval(fetchNav, 5000);
};

const stopPolling = () => {
    if (navPollingInterval) clearInterval(navPollingInterval);
    navPollingInterval = null;
    if (navLiveText) navLiveText.textContent = 'Live updates paused';
}

viewAllFundsLink.addEventListener('click', (e) => {
    e.preventDefault();
    exploreView.classList.remove('active-view');
    allFundsView.classList.add('active-view');
});

backToExploreFromAllBtn.addEventListener('click', () => {
    allFundsView.classList.remove('active-view');
    exploreView.classList.add('active-view');
});

backToExploreBtn.addEventListener('click', () => {
    stopPolling();
    fundDetailView.classList.remove('active-view');
    exploreView.classList.add('active-view');
    selectedScheme = null;
});

// Invest Widget Tabs
tabSip.addEventListener('click', () => {
    tabSip.classList.add('active');
    tabLumpsum.classList.remove('active');
    formSip.style.display = 'block';
    formLumpsum.style.display = 'none';
    paymentStep.style.display = 'none';
});

tabLumpsum.addEventListener('click', () => {
    tabLumpsum.classList.add('active');
    tabSip.classList.remove('active');
    formLumpsum.style.display = 'block';
    formSip.style.display = 'none';
    paymentStep.style.display = 'none';
});

// Payment flow
sipInvestBtn.addEventListener('click', () => {
    paymentStep.style.display = 'block';
});
lumpsumInvestBtn.addEventListener('click', () => {
    paymentStep.style.display = 'block';
});

confirmPaymentBtn.addEventListener('click', () => {
    paymentStep.style.display = 'none';
    formSip.style.display = 'none';
    formLumpsum.style.display = 'none';
    paymentSuccess.style.display = 'block';
});

init();
