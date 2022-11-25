/* eslint-disable */

// Register
//////////////////////////////////////////////////////////////////////////

const regName = document.querySelector('#reg-name');
const regEmail = document.querySelector('#reg-email');
const regPwd = document.querySelector('#reg-password');
const regRepPwd = document.querySelector('#reg-repeat-password');
const regForm = document.querySelector('#register-form');

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

if (regForm != 'undefined' && regForm) {
  let matchName = true;
  let matchEmail = true;
  let matchPassword = true;
  let matchRepeatPassword = true;

  // Name
  regName.addEventListener('keyup', (e) => {
    const pattern = /^[a-zA-Z ]*$/gm;
    matchName = patternCheckBorderColor(
      pattern,
      regName,
      'Only letters allowed !!'
    );
  });

  regName.addEventListener('focusout', (e) => {
    regName.style.borderColor = '#e8e8e8';
  });

  // Email
  regEmail.addEventListener('keyup', (e) => {
    const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    matchEmail = patternCheckBorderColor(
      pattern,
      regEmail,
      'Should be of Email format !!'
    );
  });

  regEmail.addEventListener('focusout', (e) => {
    regEmail.style.borderColor = '#e8e8e8';
  });

  // Password
  regPwd.addEventListener('keyup', (e) => {
    matchPassword = lengthCheckBorderColor(8, 20, regPwd);
  });

  regPwd.addEventListener('focusout', (e) => {
    regPwd.style.borderColor = '#e8e8e8';
  });

  // Repeat Password
  regRepPwd.addEventListener('keyup', (e) => {
    const password = regPwd.value;
    if (password === regRepPwd.value) {
      regRepPwd.style.borderColor = '#008000';
      matchRepeatPassword = true;
    } else {
      regRepPwd.style.borderColor = '#FF0000';
      matchRepeatPassword = false;
    }
  });

  // regRepPwd.addEventListener('focusout', (e) => {
  //   regRepPwd.style.borderColor = '#e8e8e8';
  // });

  regForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    let errMessage = document.querySelector('#err-msg');
    if (!matchEmail || !matchName || !matchPassword || !matchRepeatPassword) {
      errMessage.textContent = 'Please enter valid data in the fields!';
      return setTimeout(() => (errMessage.textContent = ''), 2000);
    }
    const res = await axios({
      method: 'POST',
      url: '/register',
      data: {
        email: regEmail.value,
        password: regPwd.value,
        name: regName.value,
        repeatPassword: regRepPwd.value,
      },
    });

    if (res.data.status === 'success') {
      let timerInterval;
      Swal.fire({
        title: 'You have successfully registered!',
        html: 'Please login.',
        timer: 2000,
        didOpen: () => {
          Swal.showLoading();
          const b = Swal.getHtmlContainer().querySelector('b');
          timerInterval = setInterval(() => {
            b.textContent = Swal.getTimerLeft();
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      }).then((result) => {
        /* Read more about handling dismissals below */
        window.location.href = '/login';
        if (result.dismiss === Swal.DismissReason.timer) {
          window.location.href = '/login';
        }
      });
    } else {
      errMessage.textContent = res.data.message;
      setTimeout(() => (errMessage.textContent = ''), 3000);
    }
  });
}
