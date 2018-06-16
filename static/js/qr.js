$(document).ready(function(){
  var typeNumber = 4;
  var errorCorrectionLevel = 'L';
  var qr = qrcode(typeNumber, errorCorrectionLevel);
  var factor = 250;
  if ($(window).width() < 768) {
    factor = 100;
  }
  var cells = Math.floor($(window).width() / factor);
  qr.addData('TEST TEST TEST');
  qr.make();
  $("#my_code").attr("href", qr.createDataURL(cells, 0, 0));
});
