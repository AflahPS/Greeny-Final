/* eslint-disable */

// Login
//////////////////////////////////////////////////////////////////////////
const loginEmail = document.querySelector('#login-email');
const loginPassword = document.querySelector('#login-password');
const loginForm = document.querySelector('#login-form');

const patternCheckBorderColor = (pattern, element, errMessage) => {
  const regErr = document.querySelectorAll('.reg-err') || null;
  if (regErr.length) {
    regErr.forEach((el) => (el.style.display = 'none'));
  }
  if (element.value.match(pattern)) {
    element.style.borderColor = '#008000';
    return true;
  } else {
    element.style.borderColor = '#FF0000';
    const html = `<small class="text-danger text-center mt-2 reg-err" >${errMessage}</small>`;
    element.insertAdjacentHTML('afterend', html);
    return false;
  }
};

const lengthCheckBorderColor = (min, max, element) => {
  const regErr = document.querySelectorAll('.reg-err') || null;
  if (regErr.length) {
    regErr.forEach((el) => (el.style.display = 'none'));
  }
  if (element.value.length >= min && element.value.length <= max) {
    element.style.borderColor = '#008000';
    return true;
  } else {
    element.style.borderColor = '#FF0000';
    const html = `<small class="text-danger text-center mt-2 reg-err" >Min: ${min}, Max: ${max}</small>`;
    element.insertAdjacentHTML('afterend', html);
    return false;
  }
};

if (loginForm !== 'undefined' && loginForm) {
  let matchEmail = true;
  let matchPassword = true;
  if (loginEmail !== 'undefined' && loginEmail) {
    loginEmail.addEventListener('keyup', (e) => {
      const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
      matchEmail = patternCheckBorderColor(
        pattern,
        loginEmail,
        'Invalid email !'
      );
    });

    loginEmail.addEventListener('focusout', (e) => {
      loginEmail.style.borderColor = '#e8e8e8';
    });
  }
  if (loginPassword !== 'undefined' && loginPassword) {
    loginPassword.addEventListener('keyup', (e) => {
      matchPassword = lengthCheckBorderColor(8, 20, loginPassword);
    });

    loginPassword.addEventListener('focusout', (e) => {
      loginPassword.style.borderColor = '#e8e8e8';
    });
  }

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    let errMessage = document.querySelector('#err-msg');
    if (!matchEmail || !matchPassword) return;
    const res = await axios({
      method: 'POST',
      url: '/login',
      data: {
        email: loginEmail.value,
        password: loginPassword.value,
      },
    });
    if (res.data.status === 'success') {
      window.location.href = !res.data.isUser ? '/admin' : '/';
    } else {
      errMessage.textContent = res.data.message;
      setTimeout(() => (errMessage.textContent = ''), 2000);
    }
  });
}
