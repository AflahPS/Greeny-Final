/* eslint-disable */
// recursive();
// function recursive() {
//   $('a#remove-product-checkout').on('click', async function (e) {
//     e.preventDefault();
//     const pid = $(this).data('pid');
//     const res = await axios({
//       method: 'post',
//       url: '/cart-remove',
//       data: {
//         pid,
//       },
//     });

//     if (res.data.status === 'success') {
//       const htmlToInsert = htmlGenerator(res.data.cart);
//       $('#append-here').empty();
//       $('#append-here').append(htmlToInsert);

//       $('button.header-cart>sup').text(res.data.cart.products.length);
//       $('button.header-cart>span>small').text(`₹ ${res.data.cart.totalAmount}`);
//       recursive();
//     }
//   });
// }
// function htmlGenerator(cart) {
//   const discount = cart.products.reduce(
//     (acc, cur) => acc + cur.product.price * (cur.product.discount / 100),
//     0
//   );
//   const html = `<div class="table-scroll">
//  <table class="table-list">
//    <thead>
//      <tr>
//        <th scope="col">Serial</th>
//        <th scope="col">Product</th>
//        <th scope="col">Name</th>
//        <th scope="col">Price</th>
//        <th scope="col">quantity</th>
//        <th scope="col">Amount</th>
//        <th scope="col">action</th>
//      </tr>
//    </thead>
//    <tbody>
//   ${cart.products.reduce((acc, prodObj, index) => {
//     acc += `<tr>
//        <td class="table-serial">
//          <h6>${index + 1}</h6>
//        </td>

//        <td class="table-image"><img src="images/product/${
//          prodObj.product.thumbnail
//        }" alt="product"></td>

//        <td class="table-name">
//          <h6>${prodObj.product.name}</h6>
//        </td>

//        <td class="table-price">
//          <h6>₹${prodObj.product.price}<small>/${
//       prodObj.product.unitIn
//     }</small></h6>
//        </td>

//        <td class="table-quantity">
//          <h6>${prodObj.quantity}</h6>
//        </td>

//        <td class="table-brand">
//          <h6>₹${prodObj.product.price * prodObj.quantity}</h6>
//        </td>

//        <td class="table-action">
//          <a class="view" href="#" title="Quick View" data-bs-toggle="modal" data-bs-target="#id-${
//            prodObj.product._id
//          }">
//            <i class="fas fa-eye"></i>
//          </a>
//          <a class="trash" href="#" data-pid="${
//            prodObj.product._id
//          }" id="remove-product-checkout" title="Remove from order">
//            <i class="icofont-trash"></i>
//          </a>
//        </td>

//      </tr>
//      `;
//     return acc;
//   }, ``)}

//    </tbody>
//  </table>
// </div>
// <div class="chekout-coupon">
//       <button class="coupon-btn">Do you have a coupon code?</button>
//           <form class="coupon-form">
//               <input type="text" placeholder="Enter your coupon code">
//               <button type="submit"><span>apply</span>
//               </button>
//           </form>
//       </div>
//       <div class="checkout-charge">
//           <ul>
//               <li><span>Sub total</span><span>₹${cart.totalAmount}</span></li>
//               <li><span>delivery fee</span><span>+₹10.00</span></li>
//               <li><span>discount</span><span>-${discount}</span></li>
//               <li><span>Total<small>(Incl. VAT)</small></span><span id="checkout-total">₹${
//                 cart.totalAmount + 10 - discount
//               }</span></li>
//           </ul>
//       </div>`;
//   return html;
// }
