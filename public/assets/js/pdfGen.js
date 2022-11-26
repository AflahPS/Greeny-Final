/* eslint-disable */

async function generatePDF() {
  var pdfObject = jsPDFInvoiceTemplate.default(await propsMake()); //returns number of pages created
  console.log('object Created', pdfObject);
}

var propsMake = async () => {
  const date = $('#date-range').text();
  const res = await axios({
    method: 'POST',
    url: '/admin/custom-orders',
    data: { date },
  });
  const orders = res.data.orders;
  if (res.data.status === 'success')
    return {
      outputType: jsPDFInvoiceTemplate.OutputType.Save,
      returnJsPDFDocObject: true,
      fileName: `Orders ${date} `,
      orientationLandscape: true,
      compress: true,
      logo: {
        src: '/images/logo.png',
        type: 'PNG', //optional, when src= data:uri (nodejs case)
        width: 53.33, //aspect ratio = width/height
        height: 26.66,
        margin: {
          top: 0, //negative or positive num, from the current position
          left: 0, //negative or positive num, from the current position
        },
      },
      stamp: {
        inAllPages: true, //by default = false, just in the last page
        src: 'https://raw.githubusercontent.com/edisonneza/jspdf-invoice-template/demo/images/qr_code.jpg',
        type: 'JPG', //optional, when src= data:uri (nodejs case)
        width: 20, //aspect ratio = width/height
        height: 20,
        margin: {
          top: 0, //negative or positive num, from the current position
          left: 0, //negative or positive num, from the current position
        },
      },
      business: {
        name: 'Greeny Inc',
        address: 'Albania, Tirane ish-Dogana, Durres 2001',
        phone: '(+91) 069 11 11 111',
        email: 'support@greeny.com',
        email_1: 'info@greeny.com',
        website: 'www.greeny.com',
      },
      invoice: {
        label: 'Total Orders: ',
        num: orders.length,
        invDate: `From: ${date.split(' - ')[0]}`,
        invGenDate: `To: ${date.split(' - ')[1]}`,
        headerBorder: true,
        tableBodyBorder: true,
        header: [
          {
            title: '#',
            style: {
              width: 10,
            },
          },
          {
            title: 'Username',
            style: {
              width: 30,
            },
          },
          {
            title: 'User Phone',
            style: {
              width: 30,
            },
          },
          {
            title: 'Order ID',
            style: {
              width: 50,
            },
          },
          { title: 'Location' },
          {
            title: 'Date',
            style: {
              width: 30,
            },
          },
          { title: 'Quantity' },
          { title: 'Total' },
        ],
        table: Array.from(Array(orders.length), (item, index) => [
          index + 1,
          orders[index].user.name,
          orders[index].address.phone,
          orders[index].oid,
          orders[index].address.state,
          new Date(orders[index].createdAt).toLocaleDateString('en-IN'),
          orders[index].products.length,
          orders[index].totalAmount,
        ]),
        additionalRows: [
          {
            col1: 'Total:',
            col2: '145,250.50',
            col3: 'ALL',
            style: {
              fontSize: 14, //optional, default 12
            },
          },
          {
            col1: 'VAT:',
            col2: '20',
            col3: '%',
            style: {
              fontSize: 10, //optional, default 12
            },
          },
          {
            col1: 'SubTotal:',
            col2: '116,199.90',
            col3: 'ALL',
            style: {
              fontSize: 10, //optional, default 12
            },
          },
        ],
      },
      footer: {
        text: 'The invoice is created on a computer and is valid without the signature and stamp.',
      },
      pageEnable: true,
      pageLabel: 'Page ',
    };
};

async function xcelGen() {
  const date = $('#date-range').text();
  const res = await axios({
    method: 'POST',
    url: '/admin/custom-orders',
    data: { date },
  });
  const orders = res.data.orders;
  if (res.data.status === 'success') {
    const wb = XLSX.utils.book_new();
    wb.props = {
      Title: `Order-List-${date}`,
      Subject: `Order-List`,
      Author: `Greeny-Administrator`,
      CreatedDate: new Date(),
    };
    wb.SheetNames.push(`Orders`);
    let ws_data = [
      [
        '#',
        'OrderID',
        'Username',
        'User Email',
        'User Phone',
        'Delivery Location',
        'Order Date',
        'Total Items',
        'Total Amount',
        'Payment Method',
      ],
      ['', '', '', '', '', '', '', '', '', ''],
    ];
    const orderData = orders.map((el, ind) => [
      ind + 1,
      el.oid,
      el.user.name,
      el.user.email,
      el.address.phone,
      el.address.state,
      new Date(el.createdAt).toLocaleDateString('en-IN'),
      el.products.length,
      el.totalAmount,
      el.paymentMode,
    ]);
    ws_data.push(...orderData);
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [
      { wch: 4 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 25 },
    ];
    wb.Sheets[`Orders`] = ws;

    const wsBinaryOut = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function sheetToArrayBuffer(sheet) {
      const buf = new ArrayBuffer(sheet.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < sheet.length; i++) {
        view[i] = sheet.charCodeAt(i) & 0xff;
      }
      return buf;
    }
    saveAs(
      new Blob([sheetToArrayBuffer(wsBinaryOut)], {
        type: 'application/octet-stream',
      }),
      'orders.xlsx'
    );
  }
}
