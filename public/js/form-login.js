/* eslint-disable */

// Login
//////////////////////////////////////////////////////////////////////////
const loginEmail = document.querySelector('#login-email');
const loginPassword = document.querySelector('#login-password');
// const resetForm = document.querySelector('#form-reset-password');

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

if (loginEmail !== 'undefined' && loginEmail) {
  loginEmail.addEventListener('keyup', (e) => {
    const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    patternCheckBorderColor(pattern, loginEmail, 'Invalid email !');
  });

  loginEmail.addEventListener('focusout', (e) => {
    loginEmail.style.borderColor = '#e8e8e8';
  });
}
if (loginPassword !== 'undefined' && loginPassword) {
  loginPassword.addEventListener('keyup', (e) => {
    lengthCheckBorderColor(6, 20, loginPassword);
  });

  loginPassword.addEventListener('focusout', (e) => {
    loginPassword.style.borderColor = '#e8e8e8';
  });
}
