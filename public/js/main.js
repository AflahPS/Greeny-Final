/* eslint-disable */

$(window).on('scroll', function () {
  $(this).scrollTop() > 130
    ? $('.header-part').addClass('active')
    : $('.header-part').removeClass('active');
}),
  $(window).on('scroll', function () {
    $(this).scrollTop() > 700 ? $('.backtop').show() : $('.backtop').hide();
  }),
  $(function () {
    $('.dropdown-link').click(function () {
      $(this).next().toggle(),
        $(this).toggleClass('active'),
        $('.dropdown-list:visible').length > 1 &&
          ($('.dropdown-list:visible').hide(),
          $(this).next().show(),
          $('.dropdown-link').removeClass('active'),
          $(this).addClass('active'));
    });
  }),
  $('.nav-link').on('click', function () {
    $('.nav-list li a').removeClass('active'), $(this).addClass('active');
  }),
  $('.header-cate, .cate-btn').on('click', function () {
    $('body').css('overflow', 'hidden'),
      $('.category-sidebar').addClass('active'),
      $('.category-close').on('click', function () {
        $('body').css('overflow', 'inherit'),
          $('.category-sidebar').removeClass('active'),
          $('.backdrop').fadeOut();
      });
  }),
  $('.header-user').on('click', function () {
    $('body').css('overflow', 'hidden'),
      $('.nav-sidebar').addClass('active'),
      $('.nav-close').on('click', function () {
        $('body').css('overflow', 'inherit'),
          $('.nav-sidebar').removeClass('active'),
          $('.backdrop').fadeOut();
      });
  }),
  $('.header-cart, .cart-btn').on('click', function () {
    $('body').css('overflow', 'hidden'),
      $('.cart-sidebar').addClass('active'),
      $('.cart-close').on('click', function () {
        $('body').css('overflow', 'inherit'),
          $('.cart-sidebar').removeClass('active'),
          $('.backdrop').fadeOut();
      });
  }),
  $('.header-user, .header-cart, .header-cate, .cart-btn, .cate-btn').on(
    'click',
    function () {
      $('.backdrop').fadeIn(),
        $('.backdrop').on('click', function () {
          $(this).fadeOut(),
            $('body').css('overflow', 'inherit'),
            $('.nav-sidebar').removeClass('active'),
            $('.cart-sidebar').removeClass('active'),
            $('.category-sidebar').removeClass('active');
        });
    }
  ),
  $('.coupon-btn').on('click', function () {
    $(this).hide(), $('.coupon-form').css('display', 'flex');
  }),
  $('.header-src').on('click', function () {
    $('.header-form').toggleClass('active'),
      $(this).children('.fa-search').toggleClass('fa-times');
  }),
  $('.wish').on('click', async function (ev) {
    ev.preventDefault();
    const pid = $(this).data('pid');

    const res = await axios({
      method: 'patch',
      url: '/wish-main',
      data: {
        pid,
      },
    });

    if (res.data.status === 'success') {
      $(this).toggleClass('active');
      $('.header-widget-group>a.header-widget>sup.wishlist-count').text(
        res.data.wishlist.products.length
      );
      $('#mob-wish-sup').text(res.data.wishlist.products.length);
      $('#wish-round').css('filter', 'drop-shadow(0px 0px 12px red)');
      $('#wish-round').css('transition', 'all 0.25s ease-out');
      $('#mob-wish-round').css('color', 'orangered');
      $('#mob-wish-round').css('filter', 'drop-shadow(0px 0px 12px red)');
      $('#mob-wish-round').css('transition', 'all 0.25s ease-out');
      setTimeout(() => {
        $('#wish-round').css('filter', 'none');
        $('#mob-wish-round').css('filter', 'none');
        $('#mob-wish-round').css('color', '#555555');
      }, 1000);
    } else {
      alert(res.data.message);
    }
  }),
  $('.review-widget-btn').on('click', function () {
    $(this).next('.review-widget-list').toggle();
  }),
  $('.offer-select').on('click', function () {
    $(this).text('Copied!');
  }),
  $('.modal').on('shown.bs.modal', function (e) {
    $('.preview-slider, .thumb-slider').slick('setPosition', 0);
  }),
  $('.profile-card.schedule').on('click', function () {
    $('.profile-card.schedule').removeClass('active'),
      $(this).addClass('active');
  }),
  $('.profile-card.contact').on('click', function () {
    $('.profile-card.contact').removeClass('active'),
      $(this).addClass('active');
  }),
  $('.profile-card.address').on('click', function () {
    $('.profile-card.address').removeClass('active'),
      $(this).addClass('active');
  }),
  $('.payment-card.payment').on('click', function () {
    $('.payment-card.payment').removeClass('active'),
      $(this).addClass('active');
  }),
  $('.product-add').on('click', async function () {
    const pid = $(this).data('pid');
    const action = $(this).data('action');

    if (!pid || !action) {
      const message = $(this).children('span').text();
      return Swal.fire({
        icon: 'warning',
        text: `${message} !`,
        timer: 3000,
        showConfirmButton: true,
      });
    }

    const res = await axios({
      method: 'patch',
      url: '/cart-main',
      data: {
        pid,
        action,
      },
    });
    if (
      res.data.status === 'success' &&
      res.data.cart.products.find((el) => el.product._id == pid).quantity <= 12
    ) {
      $('button.header-cart>sup').text(res.data.cart.products.length);
      $('button.header-cart>span>small').text(`₹ ${res.data.cart.totalAmount}`);
      $('#mob-cart-sup').text(res.data.cart.products.length);

      $('#cart-round').css('filter', 'drop-shadow(0px 0px 12px red)');
      $('#cart-round').css('transition', 'all 0.25s ease-out');
      $('#mob-cart-round').css('filter', 'drop-shadow(0px 0px 5px red)');
      $('#mob-cart-round').css('color', 'orangered');
      $('#mob-cart-round').css('transition', 'all 0.25s ease-out');
      setTimeout(() => {
        $('#cart-round').css('filter', 'none');
        $('#mob-cart-round').css('filter', 'none');
        $('#mob-cart-round').css('color', '#555555');
      }, 1000);

      const htmlToInsert = htmlGeneratorCart(res.data.cart);
      $('aside.cart-sidebar').empty();
      $('aside.cart-sidebar').append(htmlToInsert);
      setEventListenersCart();

      // if coupon applied, remove it:
      if (res.data.cart.couponUsed) {
        const couponId = res.data.cart.couponUsed;
        const action = 'remove';
        const result = await axios({
          method: 'POST',
          url: '/coupon-apply',
          data: {
            couponId,
            action,
          },
        });

        if (result.data.status === 'success' && $('.coupon-form')) {
          Swal.fire({
            icon: 'warning',
            text: `Applied coupon removed since there is a change in your cart !`,
            timer: 3000,
            showConfirmButton: true,
          });
        }
      }
    } else if (res.data.message === 'Product got sold out !') {
      Swal.fire({
        icon: 'warning',
        text: `${res.data.message}`,
        timer: 3000,
        showConfirmButton: true,
      });
    } else {
      Swal.fire({
        icon: 'warning',
        text: `Something went wrong !`,
        timer: 3000,
        showConfirmButton: true,
      });
    }
  }),
  $('#proceed-button').on('click', async function (ev) {
    ev.preventDefault();
    const addressIndex = $('.address.active').data('index');
    const payMode = $('.payment.active').data('pay');
    const cartId = $(this).data('cart');

    if (!cartId) {
      $(this).next('p').hide();
      return $(this).after(`<p class="text-danger">Something went wrong !</p>`);
    } else if (!addressIndex && addressIndex !== 0) {
      $(this).next('p').hide();
      return $(this).after(
        `<p class="text-danger">Please provide a valid Address !</p>`
      );
    } else if (!payMode) {
      $(this).next('p').hide();
      return $(this).after(
        `<p class="text-danger">Please provide a payment option !</p>`
      );
    } else if (!$('#checkout-check').is(':checked')) {
      $(this).next('p').hide();
      return $(this).after(
        `<p class="text-danger">Please check the agreement !</p>`
      );
    } else {
      $(this).next('p').hide();
    }
    let res;

    const result = await Swal.fire({
      title: 'Proceed with this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Proceed !',
    });
    if (result.isConfirmed) {
      res = await axios({
        method: 'post',
        url: '/proceed-to-pay',
        data: {
          cartId,
          addressIndex,
          payMode,
        },
      });
    } else {
      return;
    }

    if (payMode === 'pay-cod') {
      if (res.data.status === 'success') {
        window.location = '/invoice';
      } else {
        Swal.fire({
          icon: 'warning',
          text: `${res.data.message}`,
          timer: 3000,
          showConfirmButton: true,
        });

        $('#proceed-button').next('p').hide();
        $('#proceed-button').after(
          `<p class="text-danger">${res.data.message}</p>`
        );
      }
    } else if (payMode === 'pay-online') {
      if (res.data.status === 'success') {
        const order_id = res.data.order.id;
        const amount = res.data.order.amount;
        const currency = res.data.order.currency;

        const options = {
          key: 'rzp_test_4cPKwX5VM1t5ks',
          amount,
          currency,
          name: 'Greeny',
          description: 'Test Transaction',
          image: 'https://127.0.0.1:3000/images/logo.png',
          order_id,
          handler: async function (response) {
            const resp = await axios({
              method: 'POST',
              url: '/verify-payment',
              data: {
                signature: response.razorpay_signature,
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
              },
            });

            if (resp.data.status === 'success') {
              window.location = '/invoice';
            } else {
              $('#proceed-button').next('p').hide();
              $('#proceed-button').after(
                `<p class="text-danger">We are really sorry, Something went wrong !</p>`
              );
            }
          },
          prefill: {
            name: res.data.user.name,
            email: res.data.user.email,
            contact: res.data.user.address[0].phone,
          },
          notes: {
            address: 'Razorpay Corporate Office',
          },
          theme: {
            color: '#119744',
          },
        };
        var rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response) {
          console.error(response.error.code);
          console.error(response.error.description);
          console.error(response.error.source);
          console.error(response.error.step);
          console.error(response.error.reason);
          console.error(response.error.metadata.order_id);
          console.error(response.error.metadata.payment_id);
          $('#proceed-button').next('p').hide();
          $('#proceed-button').after(
            `<p class="text-danger">We are really sorry, Something went wrong !</p>`
          );
        });
        rzp1.open();
      }
    } else {
      $(this).next('p').hide();
      $(this).after(`<p class="text-danger">Something went wrong !</p>`);
    }
  });
setEventListenersCart();
$('.coupon-form').on('submit', async function (e) {
  e.preventDefault();

  const couponCode = $(this).serialize().split('=')[1];
  const action = $('#submit-span').text().toLowerCase();

  const res = await axios({
    method: 'POST',
    url: '/coupon-apply',
    data: {
      couponCode,
      action,
    },
  });

  if (res.data.status === 'success' && action === 'apply') {
    $(this).children('input').attr('readonly', 'readonly');
    $(this).children('button').children('span').text('remove');
    $('#submit-span').parent('button').closest('div').children('small').hide();
    const coupon = res.data.cart.couponUsed;
    $('#coupon-display').text(
      `APPLIED COUPON: ${coupon.name}, ${
        coupon.couponType === 'flat'
          ? `-₹${coupon.discount}`
          : `${coupon.discount}% OFF`
      }`
    );
    $('#coupon-discount-li').replaceWith(
      `<li id="coupon-discount-li"><span>Coupon Discount</span><span>-₹${res.data.cart.couponDiscount}</span></li>`
    );

    $('#checkout-total').replaceWith(
      `<li id="checkout-total"><span>Total<small>(Incl. VAT)</small></span><span>₹${
        res.data.cart.totalAmount +
        10 -
        res.data.cart.discount -
        res.data.cart.couponDiscount
      }</span></li>`
    );
  } else if (res.data.status === 'success' && action === 'remove') {
    $(this).children('input').removeAttr('readonly');
    $(this).children('button').children('span').text('apply');
    $('#submit-span').parent('button').closest('div').children('small').hide();
    $('#coupon-display').text('');

    $('#coupon-discount-li').replaceWith(
      `<li id="coupon-discount-li"><span>Total Discount</span><span>-₹${res.data.cart.couponDiscount}</span></li>`
    );

    $('#checkout-total').replaceWith(
      `<li id="checkout-total"><span>Total<small>(Incl. VAT)</small></span><span>₹${
        res.data.cart.totalAmount +
        10 -
        res.data.cart.discount -
        res.data.cart.couponDiscount
      }</span></li>`
    );
  } else {
    $('#submit-span').parent('button').closest('div').children('small').hide();
    $('#submit-span')
      .parent('button')
      .closest('div')
      .append(`<small class="text-danger" >${res.data.message}</small>`);
  }
});

$('a.trash.wishlist').on('click', async function (ev) {
  ev.preventDefault();
  const pid = $(this).data('pid');
  const res = await axios({
    method: 'patch',
    url: '/wish-remove',
    data: {
      pid,
    },
  });

  if (res.data.status === 'success') {
    $(this).closest('tr').remove();

    $('.header-widget-group>a.header-widget>sup.wishlist-count').text(
      res.data.wishlist.products.length
    );
    $('#mob-wish-sup').text(res.data.wishlist.products.length);

    $('#wish-round').css('filter', 'drop-shadow(0px 0px 12px red)');
    $('#wish-round').css('transition', 'all 0.25s ease-out');
    $('#mob-wish-round').css('filter', 'drop-shadow(0px 0px 5px red)');
    $('#mob-wish-round').css('color', 'orangered');
    $('#mob-wish-round').css('transition', 'all 0.25s ease-out');
    setTimeout(() => {
      $('#wish-round').css('filter', 'none');
      $('#mob-wish-round').css('filter', 'none');
      $('#mob-wish-round').css('color', '#555555');
    }, 1000);
  }
});

$('#invoice-pdf').on('click', (e) => {
  e.preventDefault();
  $('#invoice-div').printThis();
});

recursive();

// Functions

function htmlGeneratorCart(cart) {
  const baseHTML = `<div class="cart-header">
<div class="cart-total">
  <i class="fas fa-shopping-basket"></i>
  <span id="cart-toatal-item">total item (${cart.products.length})</span>
</div>
<button class="cart-close"><i class="icofont-close"></i></button>
</div>

<ul class="cart-list">
${cart.products.reduce((acc, obj) => {
  return (acc += `<li class="cart-item" data-pid="${obj.product._id}">
<div class="cart-media" data-pid="${obj.product._id}">
  <a href="/product?id=${obj.product._id}">
    <img src="/images/product/${obj.product.thumbnail}" alt="product">
  </a>
  <button class="cart-delete">
    <i class="far fa-trash-alt"></i>
  </button>
</div>
<div class="cart-info-group">
  <div class="cart-info">
    <h6><a href="/product?id=${obj.product._id}">${obj.product.name}</a></h6>
    <p class="unit-price">Unit Price - ₹${obj.product.price}</p>
  </div>
  <div class="cart-action-group">
    <div class="cart-incr">
      <button class="action-minus" data-pid="${
        obj.product._id
      }" title="Quantity Minus"><i class="icofont-minus"></i></button>
      <input class="action-input" title="Quantity Number" type="text" name="quantity" value="${
        obj.quantity
      }" disabled>
      <button class="action-plus" data-pid="${
        obj.product._id
      }" title="Quantity Plus"><i class="icofont-plus"></i></button>
    </div>
    <h6 id="cart-product-subtotal">₹${obj.quantity * obj.product.price}</h6>
  </div>
</div>
</li>`);
}, ``)}
</ul>
<div class="cart-footer">
<a class="cart-checkout-btn" href="/checkout?cart=${cart._id}">
  <span class="checkout-label">Proceed to Checkout</span>
  <span id="checkout-price" class="checkout-price">₹${cart.totalAmount}</span>
</a>
</div>
`;

  return baseHTML;
}

function setEventListenersCart() {
  $('div.cart-media').on('click', async function (ev) {
    ev.preventDefault();

    const pid = $(this).data('pid');
    const res = await axios({
      method: 'patch',
      url: '/cart-remove',
      data: {
        pid,
      },
    });

    if (res.data.status === 'success') {
      // const htmlToInsert = htmlGenerator(res.data.cart);

      $(this).closest('li').hide();
      $('#checkout-price').text(`₹${res.data.cart.totalAmount}`);
      $('#cart-toatal-item').text(
        `total item (${res.data.cart.products.length})`
      );

      $('button.header-cart>sup').text(res.data.cart.products.length);
      $('button.header-cart>span>small').text(`₹ ${res.data.cart.totalAmount}`);
      $('#mob-cart-sup').text(res.data.cart.products.length);

      const htmlToInsertCheckout = htmlGeneratorCheckout(res.data.cart);
      $('#append-here').empty();
      $('#append-here').append(htmlToInsertCheckout);
      recursive();
    }
  });

  $(`.action-minus`).on('click', async function (ev) {
    ev.preventDefault();
    const value = $(this)
      .closest('.cart-incr')
      .children('.action-input')
      .get(0).value;
    const pid = $(this).data('pid');
    value == 1 && $(this).attr('disabled', 'disabled');

    if (value == 1) {
      const resp = await axios({
        method: 'patch',
        url: '/cart-remove',
        data: {
          pid,
        },
      });

      if (resp.data.status === 'success') {
        $('ul.cart-list').children(`li[data-pid="${pid}"]`).hide();
        $('#checkout-price').text(`₹${resp.data.cart.totalAmount}`);
        $('#cart-total-item').text(
          `total item (${resp.data.cart.products.length})`
        );

        $('button.header-cart>sup').text(resp.data.cart.products.length);
        $('button.header-cart>span>small').text(
          `₹ ${resp.data.cart.totalAmount}`
        );
        $('#mob-cart-sup').text(resp.data.cart.products.length);

        const htmlToInsertCheckout = htmlGeneratorCheckout(resp.data.cart);
        $('#append-here').empty();
        $('#append-here').append(htmlToInsertCheckout);
        recursive();

        // if coupon applied, remove it:
        if (resp.data.cart.couponUsed) {
          const couponId = resp.data.cart.couponUsed;
          const action = 'remove';
          const result = await axios({
            method: 'POST',
            url: '/coupon-apply',
            data: {
              couponId,
              action,
            },
          });
          if (result.data.status === 'success' && $('.coupon-form')) {
            $('.coupon-form').children('input').removeAttr('readonly');
            $('.coupon-form').children('button').children('span').text('apply');
            $('#submit-span')
              .parent('button')
              .closest('div')
              .children('small')
              .hide();

            $('#coupon-discount-li').replaceWith(
              `<li id="coupon-discount-li"><span>Total Discount</span><span>-₹${result.data.cart.couponDiscount}</span></li>`
            );

            $('#checkout-total').replaceWith(
              `<li id="checkout-total"><span>Total<small>(Incl. VAT)</small></span><span>₹${
                result.data.cart.totalAmount +
                10 -
                result.data.cart.discount -
                result.data.cart.couponDiscount
              }</span></li>`
            );

            Swal.fire({
              icon: 'warning',
              text: `Applied coupon removed since there is a change in your cart !`,
              timer: 3000,
              showConfirmButton: true,
            });
          } else if ($('.coupon-form')) {
            $('#submit-span')
              .parent('button')
              .closest('div')
              .children('small')
              .hide();
            $('#submit-span')
              .parent('button')
              .closest('div')
              .append(
                `<small class="text-danger" >${result.data.message}</small>`
              );
          }
        }

        $('.coupon-btn').on('click', function () {
          $(this).hide(), $('.coupon-form').css('display', 'flex');
        });
      }
    } else if (value > 0) {
      const res = await axios({
        method: 'patch',
        url: '/cart-minus',
        data: {
          pid,
          value,
        },
      });

      if (res.data.status === 'success') {
        $(this).closest('.cart-incr').children('.action-input').get(0).value--;
        $(this)
          .closest('.cart-incr')
          .children('.action-plus')
          .removeAttr('disabled');

        const productObj = res.data.cart.products.find(
          (el) => el.product._id == pid
        );
        $('#checkout-price').text(`₹${res.data.cart.totalAmount}`);
        $('#cart-total-item').text(
          `total item (${res.data.cart.products.length})`
        );
        $(this)
          .parent('.cart-incr')
          .siblings(`#cart-product-subtotal`)
          .text(productObj.product.price * productObj.quantity);

        $('button.header-cart>sup').text(res.data.cart.products.length);
        $('#mob-cart-sup').text(res.data.cart.products.length);
        $('button.header-cart>span>small').text(
          `₹ ${res.data.cart.totalAmount}`
        );

        const htmlToInsertCheckout = htmlGeneratorCheckout(res.data.cart);
        $('#append-here').empty();
        $('#append-here').append(htmlToInsertCheckout);
        recursive();

        // if coupon applied, remove it:
        if (res.data.cart.couponUsed) {
          const couponId = res.data.cart.couponUsed;
          const action = 'remove';
          const result = await axios({
            method: 'POST',
            url: '/coupon-apply',
            data: {
              couponId,
              action,
            },
          });

          if (result.data.status === 'success' && $('.coupon-form')) {
            $('.coupon-form').children('input').removeAttr('readonly');
            $('.coupon-form').children('button').children('span').text('apply');
            $('#submit-span')
              .parent('button')
              .closest('div')
              .children('small')
              .hide();

            $('#coupon-discount-li').replaceWith(
              `<li id="coupon-discount-li"><span>Total Discount</span><span>-₹${result.data.cart.couponDiscount}</span></li>`
            );

            $('#checkout-total').replaceWith(
              `<li id="checkout-total"><span>Total<small>(Incl. VAT)</small></span><span>₹${
                result.data.cart.totalAmount +
                10 -
                result.data.cart.discount -
                result.data.cart.couponDiscount
              }</span></li>`
            );

            Swal.fire({
              icon: 'warning',
              text: `Applied coupon removed since there is a change in your cart !`,
              timer: 3000,
              showConfirmButton: true,
            });
          } else if ($('.coupon-form')) {
            $('#submit-span')
              .parent('button')
              .closest('div')
              .children('small')
              .hide();
            $('#submit-span')
              .parent('button')
              .closest('div')
              .append(
                `<small class="text-danger" >${result.data.message}</small>`
              );
          }
        }

        $('.coupon-btn').on('click', function () {
          $(this).hide(), $('.coupon-form').css('display', 'flex');
        });
      }
    }
  });

  // Event listener for plus button click
  $(`.action-plus`).on('click', async function (ev) {
    ev.preventDefault();
    const value = $(this)
      .closest('.cart-incr')
      .children('.action-input')
      .get(0).value;
    c = $(this).closest('.cart-incr').children('.action-minus');
    value == 0 && c.removeAttr('disabled');
    const pid = $(this).data('pid');

    if (value >= 10) {
      $(this).attr('disabled', 'disabled');
      Swal.fire({
        icon: 'warning',
        text: `A user can only purchase ${value} at a time`,
        timer: 3000,
        showConfirmButton: true,
      });
    } else {
      const res = await axios({
        method: 'patch',
        url: '/cart-plus',
        data: {
          pid,
        },
      });

      if (res.data.status === 'success') {
        $(this).closest('.cart-incr').children('.action-input').get(0).value++;
        const productObj = res.data.cart.products.find(
          (el) => el.product._id == pid
        );
        // Inside Cart
        $('#checkout-price').text(`₹${res.data.cart.totalAmount}`);
        $('#cart-total-item').text(
          `total item (${res.data.cart.products.length})`
        );
        $(this)
          .parent('.cart-incr')
          .siblings(`#cart-product-subtotal`)
          .text(productObj.product.price * productObj.quantity);

        $('button.header-cart>sup').text(res.data.cart.products.length);
        $('button.header-cart>span>small').text(
          `₹ ${res.data.cart.totalAmount}`
        );

        // Cart Icon at landing
        $('button.header-cart>sup').text(res.data.cart.products.length);
        $('button.header-cart>span>small').text(
          `₹ ${res.data.cart.totalAmount}`
        );

        // If in checkout section
        const htmlToInsertCheckout = htmlGeneratorCheckout(res.data.cart);
        $('#append-here').empty();
        $('#append-here').append(htmlToInsertCheckout);
        recursive();

        // if coupon applied, remove it:
        if (res.data.cart.couponUsed) {
          const couponCode = res.data.cart.couponUsed;
          const action = 'remove';
          const result = await axios({
            method: 'POST',
            url: '/coupon-apply',
            data: {
              couponCode,
              action,
            },
          });

          if (result.data.status === 'success' && $('.coupon-form')) {
            $('.coupon-form').children('input').removeAttr('readonly');
            $('.coupon-form').children('button').children('span').text('apply');
            $('#submit-span')
              .parent('button')
              .closest('div')
              .children('small')
              .hide();

            $('#coupon-discount-li').replaceWith(
              `<li id="coupon-discount-li"><span>Total Discount</span><span>-₹${result.data.cart.couponDiscount}</span></li>`
            );

            $('#checkout-total').replaceWith(
              `<li id="checkout-total"><span>Total<small>(Incl. VAT)</small></span><span>₹${
                result.data.cart.totalAmount +
                10 -
                result.data.cart.discount -
                result.data.cart.couponDiscount
              }</span></li>`
            );

            Swal.fire({
              icon: 'warning',
              text: `Applied coupon removed since there is a change in your cart !`,
              timer: 3000,
              showConfirmButton: true,
            });
          } else {
            if ($('.coupon-form')) {
              $('#submit-span')
                .parent('button')
                .closest('div')
                .children('small')
                .hide();
              $('#submit-span')
                .parent('button')
                .closest('div')
                .append(
                  `<small class="text-danger" >${result.data.message}</small>`
                );
            }
          }
        }

        $('.coupon-btn').on('click', function () {
          $(this).hide(), $('.coupon-form').css('display', 'flex');
        });
      } else {
        Swal.fire({
          icon: 'warning',
          text: `${res.data.message}`,
          timer: 3000,
          showConfirmButton: true,
        });
      }
    }
  });

  // Event listener for cart close button
  $('.cart-close').on('click', function () {
    $('body').css('overflow', 'inherit'),
      $('.cart-sidebar').removeClass('active'),
      $('.backdrop').fadeOut();
  });
}
function recursive() {
  $('a#remove-product-checkout').on('click', async function (e) {
    e.preventDefault();
    const pid = $(this).data('pid');
    const res = await axios({
      method: 'patch',
      url: '/cart-remove',
      data: {
        pid,
      },
    });

    if (res.data.status === 'success') {
      const htmlToInsertCheckout = htmlGeneratorCheckout(res.data.cart);
      $('#append-here').empty();
      $('#append-here').append(htmlToInsertCheckout);

      $('.coupon-btn').on('click', function () {
        $(this).hide(), $('.coupon-form').css('display', 'flex');
      });

      $('button.header-cart>sup').text(res.data.cart.products.length);
      $('#mob-cart-sup').text(res.data.cart.products.length);
      $('button.header-cart>span>small').text(`₹ ${res.data.cart.totalAmount}`);
      recursive();

      const htmlToInsertCart = htmlGeneratorCart(res.data.cart);
      $('aside.cart-sidebar').empty();
      $('aside.cart-sidebar').append(htmlToInsertCart);
      setEventListenersCart();

      // if coupon applied, remove it:
      if (res.data.cart.couponUsed) {
        const couponId = res.data.cart.couponUsed;
        const action = 'remove';
        const result = await axios({
          method: 'POST',
          url: '/coupon-apply',
          data: {
            couponId,
            action,
          },
        });

        if (result.data.status === 'success' && $('.coupon-form')) {
          $('.coupon-form').children('input').removeAttr('readonly');
          $('.coupon-form').children('button').children('span').text('apply');
          $('#submit-span')
            .parent('button')
            .closest('div')
            .children('small')
            .hide();

          $('#coupon-discount-li').replaceWith(
            `<li id="coupon-discount-li"><span>Total Discount</span><span>-₹${result.data.cart.couponDiscount}</span></li>`
          );

          $('#checkout-total').replaceWith(
            `<li id="checkout-total"><span>Total<small>(Incl. VAT)</small></span><span>₹${
              result.data.cart.totalAmount +
              10 -
              result.data.cart.discount -
              result.data.cart.couponDiscount
            }</span></li>`
          );

          Swal.fire({
            icon: 'warning',
            text: `Applied coupon removed since there is a change in your cart !`,
            timer: 3000,
            showConfirmButton: true,
          });
        } else {
          if ($('.coupon-form')) {
            $('#submit-span')
              .parent('button')
              .closest('div')
              .children('small')
              .hide();
            $('#submit-span')
              .parent('button')
              .closest('div')
              .append(
                `<small class="text-danger" >${result.data.message}</small>`
              );
          }
        }
      }
    }
  });
}
function htmlGeneratorCheckout(cart) {
  const discount = cart.products.reduce(
    (acc, cur) => acc + cur.product.price * (cur.product.discount / 100),
    0
  );
  const html = `<div class="table-scroll">
 <table class="table-list">
   <thead>
     <tr>
       <th scope="col">Serial</th>
       <th scope="col">Product</th>
       <th scope="col">Name</th>
       <th scope="col">Price</th>
       <th scope="col">quantity</th>
       <th scope="col">Amount</th>
       <th scope="col">action</th>
     </tr>
   </thead>
   <tbody>
  ${cart.products.reduce((acc, prodObj, index) => {
    acc += `<tr>
       <td class="table-serial">
         <h6>${index + 1}</h6>
       </td>

       <td class="table-image"><img src="images/product/${
         prodObj.product.thumbnail
       }" alt="product"></td>

       <td class="table-name">
         <h6>${prodObj.product.name}</h6>
       </td>

       <td class="table-price">
         <h6>₹${prodObj.product.price}<small>/${
      prodObj.product.unitIn
    }</small></h6>
       </td>

       <td class="table-quantity">
         <h6>${prodObj.quantity}</h6>
       </td>

       <td class="table-brand">
         <h6>₹${prodObj.product.price * prodObj.quantity}</h6>
       </td>

       <td class="table-action">
         <a class="view" href="#" title="Quick View" data-bs-toggle="modal" data-bs-target="#id-${
           prodObj.product._id
         }">
           <i class="fas fa-eye"></i>
         </a>
         <a class="trash" href="#" data-pid="${
           prodObj.product._id
         }" id="remove-product-checkout" title="Remove from order">
           <i class="icofont-trash"></i>
         </a>
       </td>

     </tr>
     `;
    return acc;
  }, ``)}

  
   </tbody>
 </table>
</div>
<div class="chekout-coupon">
      <button class="coupon-btn">Do you have a coupon code?</button>
          <form class="coupon-form">
              <input type="text" placeholder="Enter your coupon code">
              <button type="submit"><span>apply</span>
              </button>
          </form>
      </div>
      <div class="checkout-charge">
          <ul>
              <li><span>Sub total</span><span>₹${cart.totalAmount}</span></li>
              <li><span>delivery fee</span><span>+₹10.00</span></li>
              <li id="discount-li"><span>discount</span><span>-₹${discount}</span></li>
              <li id="coupon-discount-li"><span>discount</span><span>-₹${
                cart.couponDiscount
              }</span></li>
              <li id="checkout-total"><span>Total<small>(Incl. VAT)</small></span><span id="checkout-total">₹${
                cart.totalAmount + 10 - discount - cart.couponDiscount
              }</span></li>
          </ul>
      </div>`;
  return html;
}

$('.order-cancel-button').on('click', (e) => {
  e.preventDefault();
  const id = $(e.target).data('oid');
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, cancel the order!',
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire('Cancelled!', 'Your order has been cancelled.', 'success');
      location.href = `/order-cancel?id=${id}`;
    }
  });
});

async function sendData(e) {
  const resultOl = $('#search-result');
  const res = await axios({
    method: 'POST',
    url: '/main-live-search',
    data: {
      payload: e.value,
    },
  });
  if (res.data.status === 'success') {
    if (res.data.search < 1) {
      resultOl.empty();
      resultOl.append(`<li class="list-group-item d-flex justify-content-between align-items-start">
      <div class="ms-2 me-auto">
        Sorry, Nothing found.
      </div>
      
    </li>`);
      $(document).mouseup(function (ev) {
        if (!resultOl.is(ev.target) && resultOl.has(ev.target).length === 0) {
          resultOl.empty();
        }
      });
    } else {
      const markup = res.data.search.reduce(
        (acc, cur) =>
          acc +
          `<li class="list-group-item d-flex justify-content-between align-items-start rounded">
      <div class="ms-2 me-auto">
        <a href="/product?id=${cur._id}" class="text-success">${cur.name}</a>
      </div>
      <span class="badge bg-success rounded-pill">₹${cur.price}/${cur.unitIn}</span>
    </li>`,
        ``
      );
      resultOl.empty();
      resultOl.append(markup);
      $(document).mouseup(function (ev) {
        if (!resultOl.is(ev.target) && resultOl.has(ev.target).length === 0) {
          resultOl.empty();
        }
      });
    }
  }
}

$('#user-search-form').on('submit', async function (e) {
  e.preventDefault();
  const data = $(this).serialize();
  const res = await axios({
    method: 'POST',
    url: '/main-search',
    data,
  });
});
