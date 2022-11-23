/* eslint-disable */
// Selection
const errorMessage = document.querySelector('#error-msg');
const successMessage = document.querySelector('#success-msg');
const categoryUpdateForm = document.querySelector('#category-update-form');

// Event & On-Click handlers

//1) Category
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
