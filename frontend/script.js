const API_URL = 'http://localhost:3000/api/mf';

const mfSearch = document.getElementById('mf-search');
const mfList = document.getElementById('mf-list');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3Lumpsum = document.getElementById('step-3-lumpsum');
const step3Sip = document.getElementById('step-3-sip');
const step4 = document.getElementById('step-4');
const step5 = document.getElementById('step-5');

const schemeName = document.getElementById('scheme-name');
const schemeNav = document.getElementById('scheme-nav');
const lumpsumBtn = document.getElementById('lumpsum-btn');
const sipBtn = document.getElementById('sip-btn');
const lumpsumAmount = document.getElementById('lumpsum-amount');
const lumpsumInvestBtn = document.getElementById('lumpsum-invest-btn');
const sipAmount = document.getElementById('sip-amount');
const sipInstallments = document.getElementById('sip-installments');
const sipInvestBtn = document.getElementById('sip-invest-btn');
const accountSelection = document.getElementById('account-selection');
const confirmPaymentBtn = document.getElementById('confirm-payment-btn');

let mutualFunds = [];
let selectedScheme = null;
let investmentType = null;
let investmentAmount = 0;

const fetchMutualFunds = async () => {
    try {
        const response = await fetch(API_URL);
        mutualFunds = await response.json();
        displayMutualFunds(mutualFunds);
    } catch (error) {
        console.error('Error fetching mutual funds:', error);
    }
};

const displayMutualFunds = (funds) => {
    mfList.innerHTML = '';
    funds.forEach(fund => {
        const item = document.createElement('div');
        item.classList.add('mf-item');
        item.textContent = `${fund.schemeCode} - ${fund.schemeName}`;
        item.addEventListener('click', () => selectMutualFund(fund));
        mfList.appendChild(item);
    });
};

const selectMutualFund = async (fund) => {
    selectedScheme = fund;
    step1.style.display = 'none';
    step2.style.display = 'block';
    schemeName.textContent = fund.schemeName;
    try {
        const response = await fetch(`${API_URL}/nav/${fund.schemeCode}`);
        const data = await response.json();
        schemeNav.textContent = data.nav;
    } catch (error) {
        console.error('Error fetching NAV:', error);
        schemeNav.textContent = 'N/A';
    }
};

mfSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredFunds = mutualFunds.filter(fund =>
        fund.schemeName.toLowerCase().includes(searchTerm) ||
        fund.schemeCode.toString().includes(searchTerm)
    );
    displayMutualFunds(filteredFunds);
});

lumpsumBtn.addEventListener('click', () => {
    investmentType = 'lumpsum';
    step2.style.display = 'none';
    step3Lumpsum.style.display = 'block';
});

sipBtn.addEventListener('click', () => {
    investmentType = 'sip';
    step2.style.display = 'none';
    step3Sip.style.display = 'block';
});

const proceedToPayment = (amount) => {
    investmentAmount = amount;
    if (investmentType === 'lumpsum') {
        step3Lumpsum.style.display = 'none';
    } else {
        step3Sip.style.display = 'none';
    }
    step4.style.display = 'block';
}

lumpsumInvestBtn.addEventListener('click', () => {
    const amount = parseFloat(lumpsumAmount.value);
    if (amount > 0) {
        proceedToPayment(amount);
    } else {
        alert('Please enter a valid amount.');
    }
});

sipInvestBtn.addEventListener('click', () => {
    const amount = parseFloat(sipAmount.value);
    const installments = parseInt(sipInstallments.value);
    if (amount > 0 && installments > 0) {
        proceedToPayment(amount * installments);
    } else {
        alert('Please enter a valid amount and number of installments.');
    }
});

confirmPaymentBtn.addEventListener('click', () => {
    const selectedAccount = accountSelection.value;
    const balanceText = accountSelection.options[accountSelection.selectedIndex].text;
    const balance = parseFloat(balanceText.match(/(\d+)/)[0]);

    if (balance >= investmentAmount) {
        // Simulate CBS integration and payment deduction
        console.log(`Deducting ${investmentAmount} from ${selectedAccount}`);
        step4.style.display = 'none';
        step5.style.display = 'block';
    } else {
        alert('Insufficient balance.');
    }
});


fetchMutualFunds();
