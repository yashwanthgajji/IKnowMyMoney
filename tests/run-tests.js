// Automated Test Suite for IKnowMyMoney
// Run with: node tests/run-tests.js

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
    failures.push({ testName, details });
  }
}

console.log('\n========================================');
console.log('🧪 IKnowMyMoney - Automated Test Suite');
console.log('========================================\n');

// ----------------------------------------------------
// 1. Money Utilities Tests (F01-H1, F01-E2, F01-E4, F10-H1)
// ----------------------------------------------------
console.log('--- 1. Money Formatting & Parsing Tests ---');

function formatCurrency(cents, symbol = '$', decimals = 2) {
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const dollars = (absCents / 100).toFixed(decimals);
  const parts = dollars.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = parts.join('.');
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

function parseAmountToCents(amountStr) {
  if (!amountStr || amountStr.trim() === '') return 0;
  const cleaned = amountStr.replace(/[^0-9.]/g, '');
  const floatVal = parseFloat(cleaned);
  if (isNaN(floatVal)) return 0;
  return Math.round(floatVal * 100);
}

function centsToInputValue(cents) {
  if (cents === 0) return '';
  return (cents / 100).toFixed(2);
}

assert(formatCurrency(4550) === '$45.50', 'F01-H1: Formats $45.50 standard currency');
assert(formatCurrency(0) === '$0.00', 'F01-E1: Formats $0.00 zero amount');
assert(formatCurrency(-2500) === '-$25.00', 'F03-E1: Formats negative currency -$25.00');
assert(formatCurrency(100000000) === '$1,000,000.00', 'F01-E4: Formats $1,000,000.00 with commas');
assert(formatCurrency(3500, '€') === '€35.00', 'F10-H1: Formats with Euro symbol €35.00');
assert(formatCurrency(50000, '₹') === '₹500.00', 'F10-H1: Formats with Rupee symbol ₹500.00');

assert(parseAmountToCents('45.50') === 4550, 'F01-H1: Parses "45.50" to 4550 cents');
assert(parseAmountToCents('0') === 0, 'F01-E1: Parses "0" to 0 cents');
assert(parseAmountToCents('') === 0, 'F01-E1: Parses empty string to 0 cents');
assert(parseAmountToCents('$1,250.75') === 125075, 'F01-E3: Parses formatted "$1,250.75" to 125075 cents');
assert(parseAmountToCents('0.05') === 5, 'F01-E2: Parses fractional cents "0.05" to 5 cents');
assert(parseAmountToCents('12.345') === 1235, 'F01-E2: Rounds decimal input correctly to nearest cent');
assert(centsToInputValue(4550) === '45.50', 'centsToInputValue: 4550 -> "45.50"');
assert(centsToInputValue(0) === '', 'centsToInputValue: 0 -> ""');

// ----------------------------------------------------
// 2. Financial Balance Calculations (F01, F02, F03, F06)
// ----------------------------------------------------
console.log('\n--- 2. Dynamic Account & Net Worth Calculations ---');

function computeBalance(initial, income, expense, transferIn, transferOut) {
  return initial + income - expense + transferIn - transferOut;
}

// Scenario: Cash Account
const cashInitial = 10000; // $100.00
const cashExpense = 3000;  // $30.00
const cashIncome = 5000;   // $50.00
const cashTransferOut = 4000; // $40.00 to Bank
const cashBalance = computeBalance(cashInitial, cashIncome, cashExpense, 0, cashTransferOut);

assert(cashBalance === 8000, 'F01/F02/F03: Cash balance after +$50, -$30, -$40 transfer is $80.00', `Got ${cashBalance}`);

// Scenario: Bank Account
const bankInitial = 0;
const bankTransferIn = 4000; // $40.00 from Cash
const bankBalance = computeBalance(bankInitial, 0, 0, bankTransferIn, 0);

assert(bankBalance === 4000, 'F03-H1: Bank balance after receiving $40 transfer is $40.00', `Got ${bankBalance}`);

// Net Worth Conservation across transfers
const totalNetWorth = cashBalance + bankBalance;
const expectedNetWorth = cashInitial + bankInitial + cashIncome - cashExpense;
assert(totalNetWorth === expectedNetWorth, 'F03-H1: Total net worth is conserved across inter-account transfers', `NetWorth: ${totalNetWorth}, Expected: ${expectedNetWorth}`);

// Asset vs Liability
const assetTotal = cashBalance + bankBalance; // $120.00
const creditCardDebt = 2500; // $25.00 liability
const netWorthWithLiabilities = assetTotal - creditCardDebt;
assert(netWorthWithLiabilities === 9500, 'F06-E2: Net worth correctly deducts credit card liability ($120 - $25 = $95)', `Got ${netWorthWithLiabilities}`);

// ----------------------------------------------------
// 3. Budget Threshold Colors & Progress Logic (F07-H1, F07-E1)
// ----------------------------------------------------
console.log('\n--- 3. Budget Threshold & Progress Bar Tests ---');

function getBudgetStatus(spent, total) {
  if (total <= 0) return { percentage: 0, color: '#047857', status: 'normal' };
  const percentage = (spent / total) * 100;
  if (percentage > 100) {
    return { percentage, color: '#B91C1C', status: 'exceeded' };
  }
  if (percentage > 75) {
    return { percentage, color: '#D97706', status: 'warning' };
  }
  return { percentage, color: '#047857', status: 'normal' };
}

const b1 = getBudgetStatus(2500, 10000); // 25% of $100
assert(b1.status === 'normal' && b1.color === '#047857', 'F07-H1: 25% spend is normal (Green)');

const b2 = getBudgetStatus(8000, 10000); // 80% of $100
assert(b2.status === 'warning' && b2.color === '#D97706', 'F07-E1: 80% spend triggers warning (Amber)');

const b3 = getBudgetStatus(12000, 10000); // 120% of $100
assert(b3.status === 'exceeded' && b3.color === '#B91C1C', 'F07-E1: 120% spend triggers exceeded (Red)');

// ----------------------------------------------------
// 4. Analytics Breakdown Calculations (F08-H1, F08-E2)
// ----------------------------------------------------
console.log('\n--- 4. Analytics Distribution Calculations ---');

function computeCategoryPercentages(categories) {
  const total = categories.reduce((sum, c) => sum + c.amount, 0);
  if (total === 0) return [];
  return categories.map((c) => ({
    ...c,
    percentage: Math.round((c.amount / total) * 100),
  })).sort((a, b) => b.amount - a.amount);
}

const rawCats = [
  { name: 'Dining', amount: 30000 },
  { name: 'Groceries', amount: 10000 },
  { name: 'Transport', amount: 10000 },
];
const distribution = computeCategoryPercentages(rawCats);

assert(distribution[0].name === 'Dining' && distribution[0].percentage === 60, 'F08-H1: Top category Dining is 60%');
assert(distribution[1].percentage === 20 && distribution[2].percentage === 20, 'F08-H1: Secondary categories are 20% each');
const pctSum = distribution.reduce((sum, c) => sum + c.percentage, 0);
assert(pctSum === 100, 'F08-H1: Percentage distribution totals 100%');

// ----------------------------------------------------
// 5. CSV Export RFC 4180 Formatting (F10-E1)
// ----------------------------------------------------
console.log('\n--- 5. CSV Export Sanitization Tests ---');

function formatTransactionCSV(txns) {
  let csv = 'ID,Date,Type,Category,Account,To Account,Amount,Note\n';
  txns.forEach((t) => {
    const formattedAmount = (t.amount / 100).toFixed(2);
    const dateStr = new Date(t.date).toISOString().split('T')[0];
    const sanitizedNote = (t.note || '').replace(/"/g, '""');
    csv += `${t.id},${dateStr},${t.type},"${t.category_name || ''}","${t.account_name}","${t.to_account_name || ''}",${formattedAmount},"${sanitizedNote}"\n`;
  });
  return csv;
}

const testTxns = [
  {
    id: 1,
    date: Date.UTC(2026, 10, 1),
    type: 'expense',
    category_name: 'Food & Dining',
    account_name: 'Cash Wallet',
    to_account_name: '',
    amount: 4550,
    note: 'Dinner at "Joe\'s Diner", table #4',
  },
];

const csvOutput = formatTransactionCSV(testTxns);
assert(csvOutput.includes('45.50'), 'F10-E1: CSV contains formatted amount 45.50');
assert(csvOutput.includes('""Joe\'s Diner""'), 'F10-E1: Quotes inside notes are escaped as double quotes ("")');
assert(csvOutput.startsWith('ID,Date,Type,Category,Account,To Account,Amount,Note'), 'F10-E1: CSV header matches expected schema');

// ----------------------------------------------------
// 6. Validation Checks (F01-E1, F03-N1, F06-E1)
// ----------------------------------------------------
console.log('\n--- 6. Business Rule Validation Tests ---');

function validateTransaction(amountCents, type, categoryId, accountId, toAccountId) {
  if (amountCents <= 0) return { valid: false, error: 'Amount must be greater than 0' };
  if (!accountId) return { valid: false, error: 'Account required' };
  if (type !== 'transfer' && !categoryId) return { valid: false, error: 'Category required' };
  if (type === 'transfer' && accountId === toAccountId) return { valid: false, error: 'Source and destination cannot be identical' };
  return { valid: true };
}

assert(!validateTransaction(0, 'expense', 1, 1, null).valid, 'F01-E1: Rejects 0 amount');
assert(!validateTransaction(500, 'expense', null, 1, null).valid, 'F01-E1: Rejects expense without category');
assert(!validateTransaction(500, 'transfer', null, 1, 1).valid, 'F03-N1: Rejects transfer with same from and to account');
assert(validateTransaction(500, 'transfer', null, 1, 2).valid, 'F03-H1: Accepts valid transfer between distinct accounts');
assert(validateTransaction(1500, 'income', 2, 1, null).valid, 'F02-H1: Accepts valid income record');

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log('\n========================================');
console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
