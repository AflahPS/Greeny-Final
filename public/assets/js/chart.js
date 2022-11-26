/* eslint-disable */

/* ====== Index ======

1. DUAL LINE CHART
2. DUAL LINE CHART2
3. LINE CHART
4. LINE CHART1
5. LINE CHART2
6. AREA CHART
7. AREA CHART1
8. AREA CHART2
9. AREA CHART3
10. GRADIENT LINE CHART
11. DOUGHNUT CHART
12. POLAR CHART
13. RADAR CHART
14. CURRENT USER BAR CHART
15. ANALYTICS - USER ACQUISITION
16. ANALYTICS - ACTIVITY CHART
17. HORIZONTAL BAR CHART1
18. HORIZONTAL BAR CHART2
19. DEVICE - DOUGHNUT CHART
20. BAR CHART
21. BAR CHART1
22. BAR CHART2
23. BAR CHART3
24. GRADIENT LINE CHART1
25. GRADIENT LINE CHART2
26. GRADIENT LINE CHART3
27. ACQUISITION3
28. STATISTICS

====== End ======*/

$(document).ready(async function () {
  /*======== 33. Color Curve Bar Progressive Chart ========*/

  var curveeml_ctx = document.getElementById('chartCurveBar');
  let resp;
  try {
    resp = await axios({
      method: 'GET',
      url: '/admin/chart-daily',
    });
  } catch (error) {
    console.error(error.message);
  }
  if (
    typeof curveeml_ctx !== 'undefined' &&
    curveeml_ctx !== null &&
    resp.data.status === 'success'
  ) {
    var ctx = curveeml_ctx.getContext('2d');

    var gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
    gradientStroke.addColorStop(0, '#119744');
    gradientStroke.addColorStop(1, '#ff6c00');

    var gradientBkgrd = ctx.createLinearGradient(0, 100, 0, 400);
    gradientBkgrd.addColorStop(0, 'rgba(244,94,132,0.2)');
    gradientBkgrd.addColorStop(1, 'rgba(249,135,94,0)');

    var draw = Chart.controllers.line.prototype.draw;
    Chart.controllers.line = Chart.controllers.line.extend({
      draw: function () {
        draw.apply(this, arguments);
        var ctx = this.chart.chart.ctx;
        var _stroke = ctx.stroke;
        ctx.stroke = function () {
          ctx.save();
          //ctx.shadowColor = 'rgba(244,94,132,0.8)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 6;
          _stroke.apply(this, arguments);
          ctx.restore();
        };
      },
    });

    var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
        labels: resp.data.lastWeekDateString,
        datasets: [
          {
            label: 'Revenue',
            backgroundColor: gradientBkgrd,
            borderColor: gradientStroke,
            data: resp.data.finalData,
            pointBorderColor: 'rgba(255,255,255,0)',
            pointBackgroundColor: 'rgba(255,255,255,0)',
            pointBorderWidth: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: gradientStroke,
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 4,
            pointRadius: 1,
            borderWidth: 5,
            pointHitRadius: 16,
          },
        ],
      },

      // Configuration options go here
      options: {
        tooltips: {
          backgroundColor: '#fff',
          displayColors: false,
          titleFontColor: '#000',
          bodyFontColor: '#000',
        },
        legend: {
          display: true,
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                // Include a dollar sign in the ticks
                callback: function (value, index, values) {
                  return value / 1000 + 'K';
                },
              },
            },
          ],
        },
      },
    });
  }

  /*======== 11. DOUGHNUT CHART ========*/
  var doughnut = document.getElementById('doChart');
  let res;
  try {
    res = await axios({
      method: 'GET',
      url: '/admin/chart-doughnut',
    });
  } catch (error) {
    console.log(error.message);
  }

  if (doughnut !== null && res.data.status === 'success') {
    var myDoughnutChart = new Chart(doughnut, {
      type: 'doughnut',
      data: {
        labels: res.data.categories,

        datasets: [
          {
            label: res.data.categories,

            data: res.data.productCount,
            backgroundColor: res.data.colors,

            borderWidth: 1,
            // borderColor: ['#88aaf3','#29cc97','#8061ef','#fec402']
            // hoverBorderColor: ['#88aaf3', '#29cc97', '#8061ef', '#fec402']
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: true,
        },
        cutoutPercentage: 70,
        tooltips: {
          callbacks: {
            title: function (tooltipItem, data) {
              return 'Category : ' + data['labels'][tooltipItem[0]['index']];
            },
            label: function (tooltipItem, data) {
              return (
                data['datasets'][0]['data'][tooltipItem['index']] + ' Products'
              );
            },
          },
          titleFontColor: '#888',
          bodyFontColor: '#555',
          titleFontSize: 12,
          bodyFontSize: 14,
          backgroundColor: 'rgba(256,256,256,0.95)',
          displayColors: true,
          borderColor: 'rgba(220, 220, 220, 0.9)',
          borderWidth: 2,
        },
      },
    });
  }

  /*======== 3. LINE CHART ========*/
  var ctx = document.getElementById('linechart');
  const respo = await axios({
    method: 'GET',
    url: '/admin/chart-weekly',
  });
  if (ctx !== null && respo.data.status === 'success') {
    var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
        labels: respo.data.last8WeekString,
        datasets: [
          {
            label: '',
            backgroundColor: 'transparent',
            borderColor: 'rgb(82, 136, 255)',
            data: respo.data.finalData,
            lineTension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: 'rgba(255,255,255,1)',
            pointHoverBackgroundColor: 'rgba(255,255,255,1)',
            pointBorderWidth: 2,
            pointHoverRadius: 8,
            pointHoverBorderWidth: 1,
          },
        ],
      },

      // Configuration options go here
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        layout: {
          padding: {
            right: 10,
          },
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: true,
                color: '#eee',
                zeroLineColor: '#eee',
              },
              ticks: {
                callback: function (value) {
                  var ranges = [
                    { divider: 1e6, suffix: 'M' },
                    { divider: 1e3, suffix: 'k' },
                  ];
                  function formatNumber(n) {
                    for (var i = 0; i < ranges.length; i++) {
                      if (n >= ranges[i].divider) {
                        return (
                          (n / ranges[i].divider).toString() + ranges[i].suffix
                        );
                      }
                    }
                    return n;
                  }
                  return formatNumber(value);
                },
              },
            },
          ],
        },
        tooltips: {
          callbacks: {
            title: function (tooltipItem, data) {
              return data['labels'][tooltipItem[0]['index']];
            },
            label: function (tooltipItem, data) {
              return '₹' + data['datasets'][0]['data'][tooltipItem['index']];
            },
          },
          responsive: true,
          intersect: false,
          enabled: true,
          titleFontColor: '#888',
          bodyFontColor: '#555',
          titleFontSize: 12,
          bodyFontSize: 18,
          backgroundColor: 'rgba(256,256,256,0.95)',
          xPadding: 20,
          yPadding: 10,
          displayColors: false,
          borderColor: 'rgba(220, 220, 220, 0.9)',
          borderWidth: 2,
          caretSize: 10,
          caretPadding: 15,
        },
      },
    });
  }

  /*======== 32. Double Bar Line Chart ========*/

  var baremlctx = document.getElementById('myBarChart');
  const respon = await axios({
    method: 'GET',
    url: '/admin/chart-monthly',
  });
  if (
    typeof baremlctx !== 'undefined' &&
    baremlctx !== null &&
    respon.data.status === 'success'
  ) {
    var ctx = baremlctx.getContext('2d');
    var myBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        datasets: [
          {
            label: 'Revenue',
            data: respon.data.finalData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },

          // {
          //   label: '# of Votes2',
          //   data: [24, 38, 6, 10, 4, 6],
          //   backgroundColor: [
          //     'rgba(255, 99, 132, 0.2)',
          //     'rgba(54, 162, 235, 0.2)',
          //     'rgba(255, 206, 86, 0.2)',
          //     'rgba(75, 192, 192, 0.2)',
          //     'rgba(153, 102, 255, 0.2)',
          //     'rgba(255, 159, 64, 0.2)',
          //   ],
          //   borderColor: [
          //     'rgba(255,99,132,1)',
          //     'rgba(54, 162, 235, 1)',
          //     'rgba(255, 206, 86, 1)',
          //     'rgba(75, 192, 192, 1)',
          //     'rgba(153, 102, 255, 1)',
          //     'rgba(255, 159, 64, 1)',
          //   ],
          //   borderWidth: 1,
          // },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },

      onClick: function (e) {
        /*var activePoints = myBarChart.getElementsAtEvent(e);
      var selectedIndex = activePoints[0]._index; */
        /* alert(this.data.datasets[0].data[selectedIndex]);
       .log(this.data.datasets[0].data[selectedIndex]);
      */
      },
    });

    /* https://github.com/chartjs/Chart.js/issues/2292 */
    document.getElementById('myBarChart').onclick = function (evt) {
      var activePoints = myBarChart.getElementsAtEventForMode(
        evt,
        'point',
        myBarChart.options
      );
      var firstPoint = activePoints[0];
      var label = myBarChart.data.labels[firstPoint._index];
      var value =
        myBarChart.data.datasets[firstPoint._datasetIndex].data[
          firstPoint._index
        ];
      alert(label + ': ' + value);
    };
  }
});
