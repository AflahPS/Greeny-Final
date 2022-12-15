/* eslint-disable */

$(document).ready(function (h) {
  'use strict';
  var b = $('.sidebar-scrollbar');
  0 != b.length &&
    b
      .slimScroll({
        opacity: 0,
        height: '100%',
        color: '#808080',
        size: '5px',
        touchScrollStep: 50,
      })
      .mouseover(function () {
        $(this).next('.slimScrollBar').css('opacity', 0.5);
      }),
    768 > $(window).width() &&
      ($('.sidebar-toggle').on('click', function () {
        $('body').css('overflow', 'hidden'),
          $('.ec-tools-sidebar-overlay').fadeIn();
      }),
      $(document).on('click', '.ec-tools-sidebar-overlay', function (a) {
        $(this).fadeOut(),
          $('#body')
            .removeClass('sidebar-mobile-in')
            .addClass('sidebar-mobile-out'),
          $('body').css('overflow', 'auto');
      })),
    0 != $('.sidebar').length &&
      ($('.sidebar .nav > .has-sub > a').click(function () {
        $(this).parent().siblings().removeClass('expand'),
          $(this).parent().siblings().children('.collapse').slideUp('show'),
          $(this).parent().toggleClass('expand'),
          $(this).parent().children('.collapse').slideToggle('show');
      }),
      $('.sidebar .nav > .has-sub .has-sub > a').click(function () {
        $(this).parent().toggleClass('expand');
      })),
    768 > $(window).width() &&
      $(document).on('click', '.sidebar-toggle', function (d) {
        d.preventDefault();
        var a = 'sidebar-mobile-in',
          c = 'sidebar-mobile-out',
          b = '#body';
        $(b).hasClass(a)
          ? $(b).removeClass(a).addClass(c)
          : $(b).addClass(a).removeClass(c);
      });
  var a = $('#body');
  $(window).width() >= 768 &&
    (void 0 === window.isMinified && (window.isMinified = !1),
    void 0 === window.isCollapsed && (window.isCollapsed = !1),
    $('#sidebar-toggler').on('click', function () {
      (a.hasClass('ec-sidebar-fixed-offcanvas') ||
        a.hasClass('ec-sidebar-static-offcanvas')) &&
        ($(this)
          .addClass('sidebar-offcanvas-toggle')
          .removeClass('sidebar-toggle'),
        !1 === window.isCollapsed
          ? (a.addClass('sidebar-collapse'),
            (window.isCollapsed = !0),
            (window.isMinified = !1))
          : (a.removeClass('sidebar-collapse'),
            a.addClass('sidebar-collapse-out'),
            setTimeout(function () {
              a.removeClass('sidebar-collapse-out');
            }, 300),
            (window.isCollapsed = !1))),
        (a.hasClass('ec-sidebar-fixed') || a.hasClass('ec-sidebar-static')) &&
          ($(this)
            .addClass('sidebar-toggle')
            .removeClass('sidebar-offcanvas-toggle'),
          !1 === window.isMinified
            ? (a
                .removeClass('sidebar-collapse sidebar-minified-out')
                .addClass('sidebar-minified'),
              (window.isMinified = !0),
              (window.isCollapsed = !1))
            : (a.removeClass('sidebar-minified'),
              a.addClass('sidebar-minified-out'),
              (window.isMinified = !1)));
    })),
    $(window).width() >= 768 &&
      992 > $(window).width() &&
      (a.hasClass('ec-sidebar-fixed') || a.hasClass('ec-sidebar-static')) &&
      (a
        .removeClass('sidebar-collapse sidebar-minified-out')
        .addClass('sidebar-minified'),
      (window.isMinified = !0));
  var k = 'right-sidebar-in',
    l = 'right-sidebar-out';
  if (
    ($('.nav-right-sidebar .nav-link').on('click', function () {
      a.hasClass(k)
        ? $(this).hasClass('show') && a.addClass(l).removeClass(k)
        : a.addClass(k).removeClass(l);
    }),
    $('.card-right-sidebar .close').on('click', function () {
      a.removeClass(k).addClass(l);
    }),
    1024 >= $(window).width())
  ) {
    var m = 'right-sidebar-toggoler-in',
      i = 'right-sidebar-toggoler-out';
    a.addClass(i),
      $('.btn-right-sidebar-toggler').on('click', function () {
        a.hasClass(i)
          ? a.addClass(m).removeClass(i)
          : a.addClass(i).removeClass(m);
      });
  }
  var c = $('.notify-toggler'),
    n = $('.dropdown-notify');
  0 !== c.length &&
    (c.on('click', function () {
      n.is(':visible') ? n.fadeOut(5) : n.fadeIn(5);
    }),
    $(document).mouseup(function (a) {
      n.is(a.target) || 0 !== n.has(a.target).length || n.fadeOut(5);
    }));
  var d = $('[data-toggle="tooltip"]');
  0 != d.length &&
    d.tooltip({
      container: 'body',
      template:
        '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',
    });
  var e = $('[data-toggle="popover"]');
  0 != e.length && e.popover();
  var f = $('#basic-data-table');
  0 !== f.length &&
    f.DataTable({
      dom: '<"row mx-3 justify-content-between top-information"lf>rt<"row mx-3 justify-content-between bottom-information"ip><"clear">',
    });
  var g = $('#responsive-data-table');
  function o(a) {
    a = (a = a.replace(/^\s+|\s+$/g, '')).toLowerCase();
    for (
      var c =
          '\xe3\xe0\xe1\xe4\xe2\u1EBD\xe8\xe9\xeb\xea\xec\xed\xef\xee\xf5\xf2\xf3\xf6\xf4\xf9\xfa\xfc\xfb\xf1\xe7\xb7/_,:;',
        b = 0,
        d = c.length;
      b < d;
      b++
    )
      a = a.replace(
        new RegExp(c.charAt(b), 'g'),
        'aaaaaeeeeeiiiiooooouuuunc------'.charAt(b)
      );
    (a = a
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')),
      $('.set-slug').val(a);
  }
  0 !== g.length &&
    g.DataTable({
      aLengthMenu: [
        [20, 30, 50, 75, -1],
        [20, 30, 50, 75, 'All'],
      ],
      pageLength: 20,
      dom: '<"row mx-3 justify-content-between top-information"lf>rt<"row mx-3 justify-content-between bottom-information"ip><"clear">',
    }),
    $('body').on('change', '.ec-image-upload', function (b) {
      var c = $(this);
      if (this.files && this.files[0]) {
        var a = new FileReader();
        (a.onload = function (b) {
          var a = c
            .parent()
            .parent()
            .children('.ec-preview')
            .find('.ec-image-preview')
            .attr('src', b.target.result);
          a.hide(), a.fadeIn(650);
        }),
          a.readAsDataURL(this.files[0]);
      }
    }),
    $('.fa-span').click(function () {
      var c = $(this).text(),
        a = document.createElement('input');
      a.setAttribute('value', c),
        document.body.appendChild(a),
        a.select(),
        document.execCommand('copy'),
        document.body.removeChild(a),
        $('#fa-preview').html(
          '<code>&lt;i class=&quot;' + c + '&quot;&gt;&lt;/i&gt;</code>'
        );
      var b = document.createElement('div');
      b.setAttribute('class', 'copied'),
        b.appendChild(document.createTextNode('Copied to Clipboard')),
        document.body.appendChild(b),
        setTimeout(function () {
          document.body.removeChild(b);
        }, 1500);
    }),
    $('.zoom-image-hover').zoom(),
    $('.single-product-cover').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: !1,
      fade: !1,
      asNavFor: '.single-nav-thumb',
    }),
    $('.single-nav-thumb').slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      asNavFor: '.single-product-cover',
      dots: !1,
      arrows: !0,
      focusOnSelect: !0,
    }),
    $('.slug-title').bind('paste', function (a) {
      o(a.originalEvent.clipboardData.getData('text'));
    }),
    $('.slug-title').keypress(function () {
      o($(this).val());
    });
  var j = new Date().getFullYear();
  (document.getElementById('ec-year').innerHTML = j),
    $('#date-range').on('DOMSubtreeModified', async function () {
      if ($(this).text() && $(this).text() !== '') {
        const date = $(this).text();
        const res = await axios({
          method: 'POST',
          url: '/admin/custom-orders',
          data: { date },
        });

        if (res.data.status === 'success') {
          const html = htmlGen(res.data.orders);
          $('#orders-table tbody').empty();
          $('#orders-table tbody').append(html);
        }
      }
    });
});

const orderSelect = $('#order-status-updater');

if (orderSelect) {
  orderSelect.on('change', async function (event) {
    event.preventDefault();
    const status = $(this).val();
    const oid = $(this).data('oid');
    const res = await axios({
      method: 'PATCH',
      url: '/admin/order-status',
      data: {
        status,
        oid,
      },
    });

    if (res.data.status === 'success') {
      window.location.href = `/admin/order-single?id=${oid}`;
    }
  });
}

function htmlGen(orders) {
  return orders.reduce(
    (acc, cur) =>
      acc +
      `<tr>
  <td>
    <a class="text-dark" href="/admin/order-single?id=${cur._id}">${cur.oid}</a>
  </td>
  <td>
    <a class="text-dark" href="/admin/user-single?id=${cur.user._id}">${
        cur.user.name
      }</a>
  </td>
  <td class="d-none d-lg-table-cell">${cur.products.length}</td>
  <td class="d-none d-lg-table-cell">${moment(cur.createdAt).format('lll')}</td>
  <td class="d-none d-lg-table-cell">₹${cur.totalAmount}</td>
  <td>
    <span class="badge ${
      cur.status == 'cancelled' ? 'badge-secondary' : 'badge-primary'
    } ${cur.status == 'delivered' ? 'badge-success' : ''} ">${cur.status}</span>
  </td>

</tr>`,
    ``
  );
}
