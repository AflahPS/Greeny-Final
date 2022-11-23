/* eslint-disable */

// Selection
const errorMessage = document.querySelector('#error-msg');
const successMessage = document.querySelector('#success-msg');

const categoryUpdateForm = document.querySelector('#category-update-form');
const productUpdateForm = document.querySelector('#product-update-form');
const couponUpdateForm = document.querySelector('#coupon-update-form');
const bannerUpdateForm = document.querySelector('#banner-update-form');

// Event & On-Click handlers

// 1/6) Category
if (categoryUpdateForm != 'undefined' && categoryUpdateForm) {
  categoryUpdateForm.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const categoryId = this.dataset.catId;
    const formData = new FormData(categoryUpdateForm);
    // API request
    const res = await axios({
      method: 'PATCH',
      url: `/admin/category?id=${categoryId}`,
      data: formData,
    });
    // Handling response
    if (res.data.status === 'success') {
      successMessage.textContent = res.data.message;
    } else {
      errorMessage.textContent = res.data.message;
    }
  });
}

async function deleteCategory(e) {
  // Confirm deletion
  const confm = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  });
  if (!confm.isConfirmed) return;

  // API request
  const id = e.getAttribute('data-cat-id');
  const res = await axios({
    method: 'DELETE',
    url: `/admin/category?id=${id}`,
  });

  // Handling response
  if (res.data.status === 'success') {
    await Swal.fire('Deleted!', res.data.message, 'success');
    window.location.reload();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: res.data.message,
    });
  }
}

// 2/6) Product
if (productUpdateForm != 'undefined' && productUpdateForm) {
  productUpdateForm.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const productId = this.dataset.pid;
    const formData = new FormData(productUpdateForm);
    // API request
    const res = await axios({
      method: 'PATCH',
      url: `/admin/product?id=${productId}`,
      data: formData,
    });
    // Handling response
    if (res.data.status === 'success') {
      successMessage.textContent = res.data.message;
    } else {
      errorMessage.textContent = res.data.message;
    }
  });
}

async function deleteProduct(e) {
  // Confirm deletion
  const confm = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  });
  if (!confm.isConfirmed) return;

  // API request
  const id = e.getAttribute('data-pid');
  const res = await axios({
    method: 'DELETE',
    url: `/admin/product?id=${id}`,
  });

  // Handling response
  if (res.data.status === 'success') {
    await Swal.fire('Deleted!', res.data.message, 'success');
    window.location.reload();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: res.data.message,
    });
  }
}

// 3/6) User
async function deleteUser(e) {
  // Confirm deletion
  const confm = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  });
  if (!confm.isConfirmed) return;

  // API request
  const id = e.getAttribute('data-uid');
  const res = await axios({
    method: 'DELETE',
    url: `/admin/user?id=${id}`,
  });

  console.log(res.data);
  // Handling response
  if (res.data.status === 'success') {
    await Swal.fire('Deleted!', res.data.message, 'success');
    window.location.reload();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: res.data.message,
    });
  }
}

// 4/6) Order
async function orderCancel(e) {
  // Confirm deletion
  const confm = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, cancel this order!',
  });
  if (!confm.isConfirmed) return;

  // API request
  const id = e.getAttribute('data-oid');
  const res = await axios({
    method: 'PATCH',
    url: `/admin/order-cancel?id=${id}`,
  });

  // Handling response
  if (res.data.status === 'success') {
    await Swal.fire('Order Canceled!', res.data.message, 'success');
    window.location.reload();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: res.data.message,
    });
  }
}

// 5/6) Coupon
if (couponUpdateForm != 'undefined' && couponUpdateForm) {
  couponUpdateForm.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const couponId = this.dataset.coupId;
    const formData = new FormData(couponUpdateForm);
    // API request
    const res = await axios({
      method: 'PATCH',
      url: `/admin/coupon?id=${couponId}`,
      data: formData,
    });
    // Handling response
    if (res.data.status === 'success') {
      errorMessage.textContent = '';
      successMessage.textContent = res.data.message;
    } else {
      successMessage.textContent = '';
      errorMessage.textContent = res.data.message;
    }
  });
}

async function deleteCoupon(e) {
  // Confirm deletion
  const confm = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  });
  if (!confm.isConfirmed) return;

  // API request
  const id = e.getAttribute('data-coup-id');
  const res = await axios({
    method: 'DELETE',
    url: `/admin/coupon?id=${id}`,
  });

  // Handling response
  if (res.data.status === 'success') {
    await Swal.fire('Deleted!', res.data.message, 'success');
    window.location.reload();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: res.data.message,
    });
  }
}

// 6/6) Banner
if (bannerUpdateForm != 'undefined' && bannerUpdateForm) {
  bannerUpdateForm.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const bannerId = this.dataset.bid;
    const formData = new FormData(bannerUpdateForm);
    // API request
    const res = await axios({
      method: 'PATCH',
      url: `/admin/banner?id=${bannerId}`,
      data: formData,
    });
    // Handling response
    if (res.data.status === 'success') {
      errorMessage.textContent = '';
      successMessage.textContent = res.data.message;
    } else {
      successMessage.textContent = '';
      errorMessage.textContent = res.data.message;
    }
  });
}

async function deleteBanner(e) {
  // Confirm deletion
  const confm = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  });
  if (!confm.isConfirmed) return;

  // API request
  const id = e.getAttribute('data-bid');
  const res = await axios({
    method: 'DELETE',
    url: `/admin/banner?id=${id}`,
  });

  // Handling response
  if (res.data.status === 'success') {
    await Swal.fire('Deleted!', res.data.message, 'success');
    window.location.reload();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: res.data.message,
    });
  }
}
