$(document).ready(function () {
  const amenities = {};

  // Function to update the amenities list display
  function updateAmenities() {
    const amenityCompiled = Object.values(amenities).join(', ');
    if (amenityCompiled.length > 30) {
      $('.amenities h4').text(amenityCompiled.substring(0, 29) + '...');
    } else {
      $('.amenities h4').text(amenityCompiled);
    }
    if ($.isEmptyObject(amenities)) {
      $('.amenities h4').html('&nbsp;');
    }
  }

  // Handle checkbox click event for amenities
  $('input[type="checkbox"]').click(function () {
    const amenityID = $(this).attr('data-id');
    const amenityName = $(this).attr('data-name');
    if ($(this).prop('checked')) {
      amenities[amenityID] = amenityName;
    } else {
      delete amenities[amenityID];
    }
    updateAmenities();
  });

  // Function to check API status
  function checkApiStatus() {
    $.ajax({
      url: 'http://0.0.0.0:5001/api/v1/status/',
      type: 'GET',
      dataType: 'json',
      success: function (response) {
        if (response.status === 'OK') {
          $('DIV#api_status').addClass('available');
        } else {
          $('DIV#api_status').removeClass('available');
        }
      },
      error: function () {
        $('DIV#api_status').removeClass('available');
      }
    });
  }

  // Function to fetch and display places
  function fetchPlaces(filter = {}) {
    $.ajax({
      url: 'http://0.0.0.0:5001/api/v1/places_search/',
      type: 'POST',
      dataType: 'json',
      contentType: "application/json",
      data: JSON.stringify(filter),
      success: function (places) {
        $.get('http://0.0.0.0:5001/api/v1/users/', function (users) {
          const userDict = {};
          for (const user of users) {
            userDict[user.id] = `${user.first_name} ${user.last_name}`;
          }

          const placeArticles = places.map(place => {
            return `
              <article>
                <div class="title">
                  <h2>${place.name}</h2>
                  <div class="price_by_night">
                    $${place.price_by_night}
                  </div>
                </div>
                <div class="information">
                  <div class="max_guest">
                    <i class="fa fa-users fa-3x" aria-hidden="true"></i>
                    <br />
                    ${place.max_guest} Guests
                  </div>
                  <div class="number_rooms">
                    <i class="fa fa-bed fa-3x" aria-hidden="true"></i>
                    <br />
                    ${place.number_rooms} Bedrooms
                  </div>
                  <div class="number_bathrooms">
                    <i class="fa fa-bath fa-3x" aria-hidden="true"></i>
                    <br />
                    ${place.number_bathrooms} Bathroom
                  </div>
                </div>
                <div class="user">
                  <strong>Owner: ${userDict[place.user_id]}</strong>
                </div>
                <div class="description">
                  ${place.description}
                </div>
              </article>`;
          });

          $("section.places").empty().append(placeArticles.join(''));
        });
      },
      error: function () {
        console.error('Error fetching places');
      }
    });
  }

  // Filter places by amenities
  function filterPlacesByAmenities() {
    const selectedAmenities = Object.keys(amenities);
    if (selectedAmenities.length === 0) {
      fetchPlaces();
      return;
    }

    $.ajax({
      url: 'http://0.0.0.0:5001/api/v1/places_search/',
      type: 'POST',
      dataType: 'json',
      contentType: "application/json",
      data: JSON.stringify({}),
      success: function (places) {
        const placePromises = places.map(place => {
          return $.get(`http://0.0.0.0:5001/api/v1/places/${place.id}/amenities`)
            .then(placeAmenities => {
              const hasAllAmenities = selectedAmenities.every(id =>
                placeAmenities.some(amenity => amenity.id === id)
              );
              return hasAllAmenities ? place : null;
            });
        });

        Promise.all(placePromises).then(filteredPlaces => {
          const validPlaces = filteredPlaces.filter(place => place !== null);
          fetchUserDetailsAndRenderPlaces(validPlaces);
        });
      }
    });
  }

  // Fetch user details and render places
  function fetchUserDetailsAndRenderPlaces(places) {
    $.get('http://0.0.0.0:5001/api/v1/users/', function (users) {
      const userDict = {};
      for (const user of users) {
        userDict[user.id] = `${user.first_name} ${user.last_name}`;
      }

      const placeArticles = places.map(place => {
        return `
          <article>
            <div class="title">
              <h2>${place.name}</h2>
              <div class="price_by_night">
                $${place.price_by_night}
              </div>
            </div>
            <div class="information">
              <div class="max_guest">
                <i class="fa fa-users fa-3x" aria-hidden="true"></i>
                <br />
                ${place.max_guest} Guests
              </div>
              <div class="number_rooms">
                <i class="fa fa-bed fa-3x" aria-hidden="true"></i>
                <br />
                ${place.number_rooms} Bedrooms
              </div>
              <div class="number_bathrooms">
                <i class="fa fa-bath fa-3x" aria-hidden="true"></i>
                <br />
                ${place.number_bathrooms} Bathroom
              </div>
            </div>
            <div class="user">
              <strong>Owner: ${userDict[place.user_id]}</strong>
            </div>
            <div class="description">
              ${place.description}
            </div>
          </article>`;
      });

      $("section.places").empty().append(placeArticles.join(''));
    });
  }

  // Initial function calls
  checkApiStatus();
  fetchPlaces();

  // Handle filter button click event
  $('.container .filters button').click(function () {
    filterPlacesByAmenities();
  });
});

