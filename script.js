$(document).ready(function() {
  // Variables
  var apiKey = "&APPID=48562b7fb82f9030181f2638a31a7623";
  var date = new Date();
  var uvIndex = $("<p>").html("UV Index: ").addClass("text-secondary");

  // List of cities in search history
  var pastCities = JSON.parse(localStorage.getItem("list-of-cities"));
  if (pastCities) {
    for (var i = 0; i < pastCities.length; i++) {
      makeList(pastCities[i]);
    }
  }

  // Search button onclick event
  $("#searchBtn").on("click", function(event) {
    event.preventDefault();

    $("#forecastHeader").addClass("show");

    // User search input
    city = $("#searchCity").val();

    // Clears search input
    $("#searchCity").val("");
    makeList(city);
    saveLocalStorage(city);

    getWeather(city);
    getCurrentForecast(city);
  });

  // Get weather for current city
  function getWeather(city) {
    var queryUrl =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&units=imperial" +
      apiKey;

    $.ajax({
      url: queryUrl,
      method: "GET"
    }).then(function(response) {
      console.log(response);

      var tempF = response.main.temp;
      console.log(Math.round(tempF * 10) / 10);

      getCurrentConditions(response);
      getCurrentForecast(response);
    });
  };

  // Makes list of previously searched cities and saves to local storage
  function makeList(city) {
    let listItem = $("<li>")
      .addClass("list-group-item")
      .text(city);
    $(".list").append(listItem);
  };

  function saveLocalStorage(newCity) {
    var oldCityList = JSON.parse(localStorage.getItem("city-list"));
    if (!oldCityList) {
      var cityList = [];
      cityList.push(newCity);
      var strList = JSON.stringify(cityList);
      localStorage.setItem("city-list", strList);
    } else {
      oldCityList.push(newCity);
      var strList = JSON.stringify(oldCityList);
      localStorage.setItem("city-list", strList);
    }
  };

  // Onclick event for getting current weather and forecast for searched city
  $(document).on("click", ".list-group-item", function() {
    getWeather($(this).text());
    getCurrentForecast($(this).text());
    getCurrentConditions($(this).text());
  });

  function getCurrentConditions(response) {
    // Get the temperature and round to one decimal
    var tempF = Math.round(response.main.temp * 10) / 10;
    var feelsLike = Math.round(response.main.feels_like * 10) / 10;
    var windSpeed = Math.round(response.wind.speed * 10) / 10;

    $("#currentCity").empty();

    // Creates content for current weather conditions in searched city
    var card = $("<div>").addClass("card");
    var cardBody = $("<div>").addClass("card-body");
    var city = $("<h3>")
      .addClass("card-title text-secondary")
      .text(response.name);
    var cityDate = $("<h3>")
      .addClass("card-title text-secondary")
      .text(date.toLocaleDateString("en-US"));
    var temperature = $("<p>")
      .addClass("card-text current-temp text-secondary")
      .text("Temperature: " + tempF + " °F");
    var tempFeel = $("<p>")
      .addClass("card-text text-secondary")
      .text("Feels Like: " + feelsLike + " °F");
    var humidity = $("<p>")
      .addClass("card-text current-humidity text-secondary")
      .text("Humidity: " + response.main.humidity + "%");
    var wind = $("<p>")
      .addClass("card-text current-wind text-secondary")
      .text("Wind Speed: " + windSpeed + " MPH");
    var image = $("<img>").attr(
      "src",
      "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png"
    );

    // Adds current conditions to city card
    city.append(cityDate, image);
    cardBody.append(city, temperature, tempFeel, humidity, wind, uvIndex);
    card.append(cardBody);
    $("#currentCity").append(card);
  };

  function getCurrentForecast(city) {
    $.ajax({
      url:
        "https://api.openweathermap.org/data/2.5/forecast?q=" +
        city +
        "&units=imperial" +
        apiKey,
      method: "GET"
    }).then(function(response) {
      console.log(response);

      $("#forecastRow").empty();

      var results = response.list;
      console.log(results);

      $.ajax({
        url:
          "https://api.openweathermap.org/data/2.5/uvi?lat=" +
          response.city.coord.lat +
          "&lon=" +
          response.city.coord.lon +
          apiKey,
        method: "GET"
      }).then(function(data) {
        var uvSpan = $("<span>")
          .addClass("uv-span")
          .html(Math.round(data.value*10)/10);
        $(uvIndex).html("UV Index: ");
        $(uvIndex).append(uvSpan);
// Styles UV Index span according to value
        if (data.value <= 4) {
          $(".uv-span").css("background-color", "green");
        }

        if (data.value > 5 && data.value <= 7) {
          $(".uv-span").css("background-color", "orange");
        }
        if (data.value > 7) {
          $(".uv-span").css("background-color", "red");
        }

        var dayIndex = 0;

        for (var i = 0; i < results.length; i++) {
          if (results[i].dt_txt.indexOf("12:00:00") !== -1) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + dayIndex);
            // Get the temperature round to one decimal
            var temp = results[i].main.temp;
            var tempF = Math.round(temp*10)/10;

            var card = $("<div>").addClass(
              "card col-md-2 ml-4 bg-primary text-white"
            );
            var cardBody = $("<div>").addClass("card-body p-3 forecastBody");
            var cityDate = $("<h4>")
              .addClass("card-title")
              .text(tomorrow.toLocaleDateString("en-US"));
            var temperature = $("<p>")
              .addClass("card-text forecastTemp")
              .text("Temperature: " + tempF + "° F");
            var humidity = $("<p>")
              .addClass("card-text forecastHumidity")
              .text("Humidity: " + results[i].main.humidity + "%");

            var image = $("<img>").attr(
              "src",
              "https://openweathermap.org/img/w/" +
                results[i].weather[0].icon +
                ".png"
            );

            cardBody.append(cityDate, image, temperature, humidity);
            card.append(cardBody);
            $("#forecastRow").append(card);
            dayIndex++;
          }
        }
      });
    });
  }
});
