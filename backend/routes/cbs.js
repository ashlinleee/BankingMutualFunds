const express = require('express');
const router = express.Router();

// This is a mock database based on the provided itm.txt file.
const customers = [
    {
        "CustNo": 25220,
        "Longname": "BHAVANA NIKHIL PATIL",
        "EmailId": "bhavanab.patil@gmail.com",
    },
    {
        "CustNo": 260026,
        "Longname": "SATISH PANDURANG BIDE",
        "EmailId": "satishbide@gmail.com",
    },
    {
        "CustNo": 514953,
        "Longname": "RAHUL JAISING DESHMUKH",
        "EmailId": "rahuldeshmukh@outlook.com",
    }
];

const accounts = [
    { "LBrCode": 2, "PrdAcctId": "203000000000000311500000000", "CustNo": 25220, "AcctStat": 3, "ActTotBalLcy": 0 },
    { "LBrCode": 3, "PrdAcctId": "226000000000000121400000000", "CustNo": 25220, "AcctStat": 3, "ActTotBalLcy": 0 },
    { "LBrCode": 2, "PrdAcctId": "224000000000000129000000000", "CustNo": 260026, "AcctStat": 3, "ActTotBalLcy": -375 },
    { "LBrCode": 5, "PrdAcctId": "149000000000000055200000000", "CustNo": 514953, "AcctStat": 3, "ActTotBalLcy": 0 },
    { "LBrCode": 5, "PrdAcctId": "121000000000044752900000000", "CustNo": 25220, "AcctStat": 3, "ActTotBalLcy": 0 },
    { "LBrCode": 14, "PrdAcctId": "121000000000000079000000000", "CustNo": 514953, "AcctStat": 3, "ActTotBalLcy": 979 },
    { "LBrCode": 2, "PrdAcctId": "207000000000000041000000000", "CustNo": 25220, "AcctStat": 1, "ActTotBalLcy": -939327 },
    { "LBrCode": 2, "PrdAcctId": "225000000000000505300000000", "CustNo": 260026, "AcctStat": 3, "ActTotBalLcy": 0 },
    { "LBrCode": 7, "PrdAcctId": "1210000000000000405900000000", "CustNo": 25220, "AcctStat": 3, "ActTotBalLcy": 0 },
    { "LBrCode": 5, "PrdAcctId": "1320000000000009977300000000", "CustNo": 25220, "AcctStat": 3, "ActTotBalLcy": 0 },
    { "LBrCode": 14, "PrdAcctId": "131000000000000003000000000", "CustNo": 514953, "AcctStat": 3, "ActTotBalLcy": 0 },
    { "LBrCode": 2, "PrdAcctId": "224000000000000129600000000", "CustNo": 25220, "AcctStat": 3, "ActTotBalLcy": -3500 }
];


// Get all customers
router.get('/customers', (req, res) => {
  res.json(customers);
});

// Get accounts for a specific customer
router.get('/accounts/:custNo', (req, res) => {
    const { custNo } = req.params;
    const activeStatuses = new Set([1, 3]);
    const customerAccounts = accounts
        .filter(acc => acc.CustNo == custNo && activeStatuses.has(acc.AcctStat))
        .map(acc => ({
            custNo: acc.CustNo,
            branchCode: acc.LBrCode,
            accountId: acc.PrdAcctId,
            status: acc.AcctStat,
            balance: acc.ActTotBalLcy,
        }));

    res.json(customerAccounts);
});

module.exports = router;
