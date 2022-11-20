/* eslint-disable */

// Register
//////////////////////////////////////////////////////////////////////////

const regName = document.querySelector('#reg-name');
const regEmail = document.querySelector('#reg-email');
const regPwd = document.querySelector('#reg-password');
const regRepPwd = document.querySelector('#reg-repeat-password');

const patternCheckBorderColor = (pattern, element, errMessage) => {
  const regErr = document.querySelectorAll('.reg-err') || null;
  if (regErr.length) {
    regErr.forEach((el) => (el.style.display = 'none'));
  }
  if (element.value.match(pattern)) {
    element.style.borderColor = '#008000';
  } else {
    element.style.borderColor = '#FF0000';
    const html = `<small class="text-danger text-center mt-2 reg-err" >${errMessage}</small>`;
    element.insertAdjacentHTML('afterend', html);
  }
};

const lengthCheckBorderColor = (min, max, element) => {
  const regErr = document.querySelectorAll('.reg-err') || null;
  if (regErr.length) {
    regErr.forEach((el) => (el.style.display = 'none'));
  }
  if (element.value.length > min + 1 && element.value.length < max - 1) {
    element.style.borderColor = '#008000';
  } else {
    element.style.borderColor = '#FF0000';
    const html = `<small class="text-danger text-center mt-2 reg-err" >Min: ${min}, Max: ${max}</small>`;
    element.insertAdjacentHTML('afterend', html);
  }
};

regName.addEventListener('keyup', (e) => {
  const pattern = /^[a-zA-Z ]*$/gm;
  patternCheckBorderColor(pattern, regName, 'Only letters allowed !!');
});

regName.addEventListener('focusout', (e) => {
  regName.style.borderColor = '#e8e8e8';
});

regEmail.addEventListener('focusout', (e) => {
  regEmail.style.borderColor = '#e8e8e8';
});

regPwd.addEventListener('keyup', (e) => {
  const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  lengthCheckBorderColor(6, 20, regPwd, 'Should be of Email format !!');
});

regPwd.addEventListener('focusout', (e) => {
  regPwd.style.borderColor = '#e8e8e8';
});

regRepPwd.addEventListener('keyup', (e) => {
  const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  lengthCheckBorderColor(6, 20, regRepPwd, 'Should be of Email format !!');
});

regRepPwd.addEventListener('focusout', (e) => {
  regRepPwd.style.borderColor = '#e8e8e8';
});
