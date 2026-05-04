const API_URL = 'http://localhost:3000/api/mf';

// DOM Elements
const mfSearch = document.getElementById('mf-search');
const exploreView = document.getElementById('explore-view');
const fundDetailView = document.getElementById('fund-detail-view');
const backToExploreBtn = document.getElementById('back-to-explore');
const popularFundsGrid = document.getElementById('popular-funds-grid');
const allFundsGrid = document.getElementById('all-funds-grid');

// Details
const schemeName = document.getElementById('scheme-name');
const schemeNav = document.getElementById('scheme-nav');

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

// Initialization
const init = async () => {
    await fetchMutualFunds();
};

const fetchMutualFunds = async () => {
    try {
        const response = await fetch(API_URL);
        mutualFunds = await response.json();
        filteredFunds = [...mutualFunds];
        renderFunds();
    } catch (error) {
        console.error('Error fetching mutual funds:', error);
        // Fallback mockup data if backend fails
        mutualFunds = [
            { schemeCode: 120503, schemeName: "Nippon India Small Cap Fund" },
            { schemeCode: 119598, schemeName: "SBI Small Cap Fund" },
            { schemeCode: 118989, schemeName: "HDFC Small Cap Fund" },
            { schemeCode: 146503, schemeName: "Quant Small Cap Fund" }
        ];
        filteredFunds = [...mutualFunds];
        renderFunds();
    }
};

const renderFunds = () => {
    popularFundsGrid.innerHTML = '';
    allFundsGrid.innerHTML = '';
    
    // Just rendering all logic. For "popular", let's just pick top 3
    const popular = filteredFunds.slice(0, 3);
    
    popular.forEach(fund => popularFundsGrid.appendChild(createFundCard(fund)));
    filteredFunds.forEach(fund => allFundsGrid.appendChild(createFundCard(fund)));
};

const createFundCard = (fund) => {
    const card = document.createElement('div');
    card.classList.add('fund-card');
    // Mocking 1Y return for visual context
    const mockReturn = (Math.random() * 20 + 10).toFixed(2);
    
    card.innerHTML = `
        <div class="fund-name">${fund.schemeName}</div>
        <div class="fund-stats">
            <div>
                <span class="stat-label">1Y Return</span>
                <strong class="green-text">${mockReturn}%</strong>
            </div>
            <div>
                <span class="stat-label">Rating</span>
                <strong>4.5 ★</strong>
            </div>
        </div>
    `;
    card.addEventListener('click', () => openFundDetails(fund));
    return card;
};

// Search handling
mfSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    filteredFunds = mutualFunds.filter(fund => 
        fund.schemeName.toLowerCase().includes(term) ||
        fund.schemeCode.toString().includes(term)
    );
    renderFunds();
});

// View Navigation
const openFundDetails = async (fund) => {
    selectedScheme = fund;
    schemeName.textContent = fund.schemeName;
    schemeNav.textContent = 'Fetching...';
    
    exploreView.classList.remove('active-view');
    fundDetailView.classList.add('active-view');
    
    // Reset widget
    paymentStep.style.display = 'none';
    paymentSuccess.style.display = 'none';
    formSip.style.display = 'block';
    formLumpsum.style.display = 'none';
    tabSip.classList.add('active');
    tabLumpsum.classList.remove('active');

    try {
        const response = await fetch(`${API_URL}/nav/${fund.schemeCode}`);
        if(response.ok) {
            const data = await response.json();
            schemeNav.textContent = `₹${data.nav}`;
        } else {
             schemeNav.textContent = `₹${(Math.random() * 200 + 50).toFixed(2)}`; // fallback mock NAV
        }
    } catch {
       schemeNav.textContent = `₹${(Math.random() * 200 + 50).toFixed(2)}`; // fallback mock NAV
    }
};

backToExploreBtn.addEventListener('click', () => {
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
