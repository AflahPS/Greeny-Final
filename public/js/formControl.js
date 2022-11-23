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
    console.log(err.message);
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
    console.log(err.message);
  }
};
