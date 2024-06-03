$(document).ready(function () {
  const amenities = {};
  $('input[type="checkbox"]').click(function () {
    const amenityID = $(this).attr('data-id');
    const amenityName = $(this).attr('data-name');
    if ($(this).prop('checked') === true) {
      amenities[amenityID] = amenityName;
    } else if ($(this).prop('checked') === false) {
      delete amenities[amenityID];
    }
    const amenityCompiled = Object.values(amenities).join(',');
    if (amenityCompiled.length > 30) {
      $('.amenities h4').text(amenityCompiled.substring(0, 29) + '...');
    } else {
      $('.amenities h4').text(amenityCompiled);
    }
    if ($.isEmptyObject(amenities)) {
      $('.amenities h4').html('&nbsp');
    }
  });
});
