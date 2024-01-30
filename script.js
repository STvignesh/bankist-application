'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Varun Ramamurthy',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2023-05-27T17:01:17.194Z',
    '2023-07-12T10:51:36.790Z',
    '2023-07-11T23:36:17.929Z',
    '2023-12-08T14:11:59.604Z',
    '2023-12-01T10:17:24.185Z',
    '2023-12-23T07:42:02.383Z',
    '2024-01-12T09:15:04.904Z',
    '2024-01-18T21:31:17.178Z',
  ],
  currency: 'INR',
  locale: 'en-IN', // de-DE
};

const account2 = {
  owner: 'Harisath Prabhu',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2023-06-25T18:49:59.371Z',
    '2023-07-26T12:01:20.894Z',
    '2023-11-10T14:43:26.374Z',
    '2023-12-05T16:33:06.386Z',
    '2023-12-25T14:18:46.235Z',
    '2023-12-25T06:04:23.907Z',
    '2024-01-13T09:48:16.867Z',
    '2024-01-11T13:15:33.035Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////

function formatMovementDate(date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (24 * 60 * 60 * 1000));
  //
  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);
  if (daysPassed === 0) return `TODAY`;
  if (daysPassed === 1) return `YESTERDAY`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // else return `${date.toLocaleDateString()}`;
  else return new Intl.DateTimeFormat(locale).format(date);
}
function formatCurrency(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}
function displayMovements(acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (movement, index) {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[index]);

    const displayDate = formatMovementDate(date, acc.locale);
    const currency = formatCurrency(movement, acc.locale, acc.currency);
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${currency}</div>
     </div>
    `;
    // this method accepts two string
    // 1) position
    // 2) string that we want to insert
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

// Here what we are gonna do is to create a function which loops over the accounts array.
// it loops over each account in account array and grab owner name from each account and then using
// the owner name we are creating the username for that account
function createUserName(accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0]) // or map(function (name){return name[0]})
      .join('');
  });
}
createUserName(accounts);
// console.log(accounts);
function calcPrintBalance(acc) {
  const balance = acc.movements.reduce(function (accumlator, movement) {
    return accumlator + movement;
  }, 0);
  acc.balance = balance;

  labelBalance.textContent = formatCurrency(balance, acc.locale, acc.currency);
}

function calcDisplaySummary(account) {
  const incomes = account.movements
    .filter(movement => movement > 0)
    .reduce((accumlator, movement) => accumlator + movement, 0);
  const out = account.movements
    .filter(movement => movement < 0)
    .reduce((accumlator, movement) => accumlator + movement, 0);

  // Each time a deposit is made 1.2% interest is given by the bank
  const interest = account.movements
    .filter(movement => movement > 0)
    .map(movement => (movement * account.interestRate) / 100)
    .filter((interest, index, arr) => interest > 1)
    .reduce((accumlator, movement) => accumlator + movement, 0);

  labelSumIn.textContent = formatCurrency(
    incomes,
    account.locale,
    account.currency
  );
  labelSumOut.textContent = formatCurrency(
    Math.abs(out),
    account.locale,
    account.currency
  );
  labelSumInterest.textContent = formatCurrency(
    interest,
    account.locale,
    account.currency
  );
}

function updateUI(account) {
  // Display Movements
  displayMovements(account);
  //Display Balance
  calcPrintBalance(account);
  //Display summary
  calcDisplaySummary(account);
}

// Implementing LOGIN
let currentAccount, timer;
// always logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;
// Expermenting API
const currentDate = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long',
  year: 'numeric', //2-digit,
  weekday: 'long',
};
const locale = navigator.language;
console.log(locale);
labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
  currentDate
);

btnLogin.addEventListener('click', function (e) {
  // prevent form from submitting
  // default form element buttom reloads the page everytime it been accessed
  // therefore we are preventing the default functionality.
  e.preventDefault();
  // console.log('LOGIN');
  currentAccount = accounts.find(
    account => account.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    console.log(currentAccount);
    //Clear fields

    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();
    // Welcome Message

    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome ${currentAccount.owner.split(' ')[0]}`;
    const currentDate = new Date();
    // const day = `${currentDate.getDate()}`.padStart(2, 0);
    // const month = `${currentDate.getMonth() + 1}`.padStart(2, 0);
    // const year = currentDate.getFullYear();
    // const hour = currentDate.getHours();
    // const minutes = currentDate.getMinutes();
    // labelDate.textContent = `${day}/${month}/${year},${hour}:${minutes}`;
    // labelDate.textContent = `${currentDate.toLocaleString()}`;

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric', //2-digit,
      // weekday: 'long',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(currentDate);
    if (timer) clearInterval(timer);
    timer = setLogoutTimer();

    updateUI(currentAccount);
  }
});
// Money Transfer
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  console.log(amount);
  const receiverAccount = accounts.find(
    account => account.username === inputTransferTo.value
  );
  // console.log(receiverAccount);
  // console.log(amount);
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance > amount &&
    receiverAccount.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);
    console.log(currentAccount.movements);
    // pushing date
    currentAccount.movementsDates.push(new Date());
    receiverAccount.movementsDates.push(new Date());
    updateUI(currentAccount);

    // reset timer
    clearInterval(timer);
    timer = setLogoutTimer();
  }
});
// Requesting Loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(Number(inputLoanAmount.value));
  if (
    amount > 0 &&
    currentAccount.movements.some(movement => movement >= amount * 0.1)
  ) {
    //  Add Movement
    setTimeout(function () {
      currentAccount.movements.push(amount);
      // Add Date
      currentAccount.movementsDates.push(new Date());
      // Update UI
      updateUI(currentAccount);
    }, 3000);
    clearInterval(timer);
    timer = setLogoutTimer();
  }
});
// Closing(Deleting) an account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  const deleteAccountName = inputCloseUsername.value;
  const deleteAccountPin = Number(inputClosePin.value);
  if (
    currentAccount.username === deleteAccountName &&
    currentAccount.pin === deleteAccountPin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // console.log(index);
    // Delete Account
    accounts.splice(index, 1);
    // console.log(accounts);

    //Hide UI
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = '';
  }
});
// Sort button
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

function setLogoutTimer() {
  function tick() {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call print the remaining time to the user interface
    labelTimer.textContent = `${min}:${sec}`;
    // when reach 0 seconds, stop the timer and log the user out
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get Started`;
    }
    //decrease 1 second
    time--;
  }
  // Set time to 5 minutes
  let time = 300;
  // call timer everysecond
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
}
