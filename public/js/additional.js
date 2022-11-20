/* eslint-disable */

const remPayProfile = async (i) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/profile-remove-payment',
      data: {
        index: i,
      },
    });
    console.log(res.status);
  } catch (err) {
    console.log(err.message);
  }
};

const remAddressCheckout = async (i) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/checkout-remove-address',
      data: {
        index: i,
      },
    });
    console.log(res.status);
  } catch (err) {
    console.log(err.message);
  }
};
const remPayCheckout = async (i) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/checkout-remove-payment',
      data: {
        index: i,
      },
    });
    console.log(res.status);
  } catch (err) {
    console.log(err.message);
  }
};

const remAddressProfile = async (i) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/profile-remove-address',
      data: {
        index: i,
      },
    });
    console.log(res.status);
  } catch (err) {
    console.log(err.message);
  }
};
