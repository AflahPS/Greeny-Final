/* eslint-disable */

const remAddressCheckout = async (i) => {
  try {
    const res = await axios({
      method: 'patch',
      url: '/checkout-remove-address',
      data: {
        index: i,
      },
    });
    // console.log(res.status);
  } catch (err) {
    console.error(err.message);
  }
};

const remAddressProfile = async (i) => {
  try {
    const res = await axios({
      method: 'patch',
      url: '/profile-remove-address',
      data: {
        index: i,
      },
    });
    // console.log(res.status);
  } catch (err) {
    console.error(err.message);
  }
};

const formEdit = document.querySelector('#edit-profile');

if (formEdit != 'undefined' && formEdit) {
  const name = document.querySelector('#profile-name');
  const email = document.querySelector('#profile-email');
  const phone = document.querySelector('#profile-phone');
  const age = document.querySelector('#profile-age');

  let matchEmail = true,
    matchName = true,
    matchPhone = true,
    matchAge = true;

  if (email !== 'undefined' && email) {
    email.addEventListener('keyup', (e) => {
      const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
      matchEmail = patternCheckBorderColor(pattern, email, 'Invalid email!');
    });
  }
  if (name !== 'undefined' && name) {
    name.addEventListener('keyup', (e) => {
      const pattern = /^[a-zA-Z ]*$/gm;
      matchName = patternCheckBorderColor(
        pattern,
        name,
        'Invalid name, Should only contain letters!'
      );
    });
  }
  if (phone !== 'undefined' && phone) {
    const pattern = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
    phone.addEventListener('keyup', (e) => {
      matchPhone = patternCheckBorderColor(
        pattern,
        phone,
        'Invalid phone number!'
      );
    });
  }

  if (age !== 'undefined' && age) {
    age.addEventListener('keyup', (e) => {
      matchAge = lengthCheckBorderColor(1, 3, age);
    });
  }

  formEdit.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const form = new FormData(formEdit);
    if (matchName && matchEmail && matchPhone && matchAge) {
      const res = await axios({
        method: 'PATCH',
        url: '/profile-edit-details',
        data: form,
      });
      // Handling response
      if (res.data.status === 'success') {
        await Swal.fire('Edited successfully!', res.data.message, 'success');
        window.location.reload();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: res.data.message,
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Fill all the fields with valid data!',
      });
    }
  });
}

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
