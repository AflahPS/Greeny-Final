/* eslint-disable */

const errMessage = document.querySelector('#errMessage');
if (errMessage != undefined && errMessage) {
  setTimeout(() => {
    errMessage.style.display = 'none';
  }, 3500);
}
// const removePay = document.querySelector('#remove-payment');
// const index = removePay.dataset.index;

// removePay.addEventListener('click', (e) => {
//   e.preventDefault();
//   axios({
//     method: 'post',
//     url: 'http://127.0.0.1:3000/profile-remove-payment',
//     data: {
//       index,
//     },
//   });
// });

// $(document).on('click', '.ec-navigation ul li', function () {
//   $(this).addClass('active').siblings().removeClass('active');
// });

// const sideNav = document.querySelector('.nav-lis');

// sideNav.forEach((li) => {
//   li.addEventListener('click', function (e) {
//     sideNav.forEach((li) => li.classList.remove('active'));
//     this.classList.add('active');
//   });
// });
