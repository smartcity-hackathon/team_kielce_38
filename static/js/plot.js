var data = [
    {label: 'Kawiarnie', value: 5},
    {label: 'Kina', value: 2},
    {label: 'Place zabaw', value: 3},
    {label: 'Restauracje', value: 4},
    {label: 'Siłownie', value: 5},
];

var targetId = 'chart';
var canvasWidth = 600;
var canvasHeight = 450;
var chart = new BarChart(targetId, canvasWidth, canvasHeight, data);


(function($) {
  "use strict"; // Start of use strict

  // Vide - Video Background Settings
  $('body').vide({
    mp4: "css/bg.mp4",
  }, {
    posterType: 'jpg'
  });

})(jQuery);
