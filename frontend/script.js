const API_BASE = 'http://localhost:3000/api';
const MF_API = `${API_BASE}/mf`;
const CBS_API = `${API_BASE}/cbs`;

const step0 = document.getElementById('step-0');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const step4Lumpsum = document.getElementById('step-4-lumpsum');
const step4Sip = document.getElementById('step-4-sip');
const step5 = document.getElementById('step-5');
const step6 = document.getElementById('step-6');

const customerSelection = document.getElementById('customer-selection');
const customerContinueBtn = document.getElementById('customer-continue-btn');
const amcSelection = document.getElementById('amc-selection');
const amcContinueBtn = document.getElementById('amc-continue-btn');
const schemeSearch = document.getElementById('scheme-search');
const schemeList = document.getElementById('scheme-list');

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

let customers = [];
let accounts = [];
let amcs = [];
let schemes = [];
let selectedCustomer = null;
let selectedAmc = null;
let selectedScheme = null;
let investmentType = null;
let investmentAmount = 0;

const unwrapData = (payload) => {
    if (!payload) {
        return [];
    }
    if (payload.data) {
        return payload.data;
    }
    return payload;
};

const fetchCustomers = async () => {
    const response = await fetch(`${CBS_API}/customers`);
    customers = await response.json();
    customerSelection.innerHTML = customers
        .map(customer => `<option value="${customer.CustNo}">${customer.Longname}</option>`)
        .join('');
};

const fetchAccounts = async (custNo) => {
    const response = await fetch(`${CBS_API}/accounts/${custNo}`);
    accounts = await response.json();
    accountSelection.innerHTML = accounts
        .map(acc => {
            const balance = Number(acc.balance).toFixed(2);
            return `<option value="${acc.accountId}" data-balance="${acc.balance}">${acc.accountId} (Balance: ${balance})</option>`;
        })
        .join('');
};

const fetchAmcs = async () => {
    const response = await fetch(`${MF_API}/amcs`);
    const payload = await response.json();
    amcs = unwrapData(payload);
    amcSelection.innerHTML = amcs
        .map(amc => `<option value="${amc.slug || amc.amc_slug || amc}">${amc.name || amc}</option>`)
        .join('');
};

const fetchSchemesForAmc = async (amcSlug) => {
    const response = await fetch(`${MF_API}/amcs/${amcSlug}`);
    const payload = await response.json();
    const amcData = unwrapData(payload);
    schemes = amcData.schemes || amcData.scheme_list || amcData || [];
    renderSchemes(schemes);
};

const renderSchemes = (schemeItems) => {
    schemeList.innerHTML = '';
    schemeItems.forEach(scheme => {
        const schemeCode = scheme.scheme_code || scheme.amfi_code || scheme.code || scheme.schemeCode;
        const schemeNameText = scheme.scheme_name || scheme.name || scheme.schemeName;
        if (!schemeCode || !schemeNameText) {
            return;
        }
        const item = document.createElement('div');
        item.classList.add('mf-item');
        item.textContent = `${schemeNameText} (${schemeCode})`;
        item.addEventListener('click', () => selectScheme({
            schemeCode,
            schemeName: schemeNameText,
        }));
        schemeList.appendChild(item);
    });
};

const selectScheme = async (scheme) => {
    selectedScheme = scheme;
    step2.style.display = 'none';
    step3.style.display = 'block';
    schemeName.textContent = scheme.schemeName;
    try {
        const response = await fetch(`${MF_API}/schemes/${scheme.schemeCode}/nav`);
        const payload = await response.json();
        const navData = unwrapData(payload);
        schemeNav.textContent = navData.nav ?? 'N/A';
    } catch (error) {
        console.error('Error fetching NAV:', error);
        schemeNav.textContent = 'N/A';
    }
};

schemeSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSchemes = schemes.filter(scheme => {
        const schemeNameText = (scheme.scheme_name || scheme.name || scheme.schemeName || '').toLowerCase();
        const schemeCode = (scheme.scheme_code || scheme.amfi_code || scheme.code || scheme.schemeCode || '').toString();
        return schemeNameText.includes(searchTerm) || schemeCode.includes(searchTerm);
    });
    renderSchemes(filteredSchemes);
});

customerContinueBtn.addEventListener('click', async () => {
    selectedCustomer = customerSelection.value;
    await fetchAccounts(selectedCustomer);
    step0.style.display = 'none';
    step1.style.display = 'block';
});

amcContinueBtn.addEventListener('click', async () => {
    selectedAmc = amcSelection.value;
    await fetchSchemesForAmc(selectedAmc);
    step1.style.display = 'none';
    step2.style.display = 'block';
});

lumpsumBtn.addEventListener('click', () => {
    investmentType = 'lumpsum';
    step3.style.display = 'none';
    step4Lumpsum.style.display = 'block';
});

sipBtn.addEventListener('click', () => {
    investmentType = 'sip';
    step3.style.display = 'none';
    step4Sip.style.display = 'block';
});

const proceedToPayment = (amount) => {
    investmentAmount = amount;
    if (investmentType === 'lumpsum') {
        step4Lumpsum.style.display = 'none';
    } else {
        step4Sip.style.display = 'none';
    }
    step5.style.display = 'block';
};

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
    const installments = parseInt(sipInstallments.value, 10);
    if (amount > 0 && installments > 0) {
        proceedToPayment(amount * installments);
    } else {
        alert('Please enter a valid amount and number of installments.');
    }
});

confirmPaymentBtn.addEventListener('click', () => {
    const selectedOption = accountSelection.options[accountSelection.selectedIndex];
    const balance = Number(selectedOption.dataset.balance || 0);

    if (balance >= investmentAmount) {
        console.log(`Deducting ${investmentAmount} from ${selectedOption.value}`);
        step5.style.display = 'none';
        step6.style.display = 'block';
    } else {
        alert('Insufficient balance.');
    }
});

const init = async () => {
    await fetchCustomers();
    await fetchAmcs();
};

init();
