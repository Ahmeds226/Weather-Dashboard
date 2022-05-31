// let APIKey = "00f3d9e72f20e0b400c7efc1fb4b2529";

let cityArr = [];

//Store recent searches after being refreshed.
function showSavedData() {
  let cityArr = JSON.parse(localStorage.getItem("citylist"));

  for (let i = 0; i < cityArr.length; i++) {
    console.log("cityArr", cityArr);

    // Make the recent searches accessible by generating buttons for them.
    let a = $("<button>").attr({
      class: "list-group-item list-group-item-action",
      id: cityArr[i],
    });

    // Inital text for the button
    a.text(cityArr[i]);

    // Give the view-results div buttons.
    $("#view-results").append(a);

    $("#" + cityArr[i]).on("click", function (event) {
      event.preventDefault();

      let cityName = this.id;

      getWeatherToday(cityName, "existing");
      getWeatherForecast(cityName, APIKey);
    });
  }
}

//onclick event to load content seperate from the HTML.
$("#search-city").on("click", function (event) {
  event.preventDefault();
  getWeatherTodayButton();
  getWeatherForecastButton(APIKey);
  saveCity();
});

function getWeatherTodayButton() {
  let cityInput = $("#city-searched").val();

  getWeatherToday(cityInput, "new");
}

function getWeatherToday(cityInput, callType) {
  $("#weather-result").html("");

  cityArr.push(cityInput);

  // Search the database.
  let queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityInput +
    "&appid=" +
    APIKey;

  let cityLat;
  let cityLon;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    let currentDate = moment().format("MM/D/YYYY");

    let weatherDiv = $('<div class="weatherdiv">');

    let getIcon = response.weather[0].icon;
    console.log("cek icon", getIcon);

    let iconURL = $("<img>").attr({
      src: "https://openweathermap.org/img/w/" + getIcon + ".png",
    });

    let city = $("<p>").html("<h3>" + response.name + " (" + currentDate + ")");
    city.append(iconURL);

    let tempF = (response.main.temp - 273.15) * 1.8 + 32;

    $(".temp").html(tempF.toFixed() + "Degree");

    //Store data locally.
    let temp = $("<p>").html("Temperature: " + tempF.toFixed() + "&deg" + "F");

    let wind = $("<p>").text("Wind Speed: " + response.wind.speed + " MPH");

    let humidity = $("<p>").text("Humidity: " + response.main.humidity + "%");

    weatherDiv.append(city, temp, wind, humidity);

    $("#weather-result").prepend(city, temp, humidity, wind);

    cityLat = response.coord.lat;
    cityLon = response.coord.lon;

    getUVInd(APIKey, cityLat, cityLon);

    //Exisiting search results.
    if (callType == "existing") return;

    for (let i = 0; i < city.length; i++) {
      let a = $("<button>").attr({
        class: "list-group-item list-group-item-action",
        id: response.name,
      });

      a.text(response.name);
      $("#view-results").append(a);

      $("#" + response.name).on("click", function (event) {
        event.preventDefault();

        let cityName = this.id;

        saveCity();

        getWeatherToday(cityName, "existing");
      });
    }
  });
}

//Function to get the UV Index.
function getUVInd(APIKey, cityLat, cityLon) {
  let queryURLUV =
    "https://api.openweathermap.org/data/2.5/uvi?lat=" +
    cityLat +
    "&lon=" +
    cityLon +
    "&appid=" +
    APIKey;

  $.ajax({
    url: queryURLUV,
    method: "GET",
  }).then(function (response) {
    console.log(response);

    //Create div dynamically for weather.
    let weatherDiv = $('<div class="weatherdiv">');

    let uvInd = $("<p>").html(
      "UV Index: " +
        "<span class='badge badge-danger p-2'>" +
        response.value +
        "</span>"
    );

    weatherDiv.append(uvInd);

    $("#weather-result").append(uvInd);
  });
}

function getWeatherForecastButton(APIKey) {
  let cityInput = $("#city-searched").val();
  getWeatherForecast(cityInput, APIKey);
}

function getWeatherForecast(cityInput, APIKey) {
  $("#weather-forecast").html("");

  let queryURLFor =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    cityInput +
    "&units=imperial&appid=" +
    APIKey;

  $.ajax({
    url: queryURLFor,
    method: "GET",
  }).then(function (response) {
    let getForInfo = response.list;

    //Due to the API refreshing every 3 hours I split up the day by 8.
    for (let i = 1; i <= getForInfo.length / 8; i++) {
      let getIcon = getForInfo[i * 7].weather[0].icon;

      let getForDate = getForInfo[i * 7].dt * 1000;
      let getWeatherDate = new Date(getForDate).getDate();
      let getWeatherMonth = new Date(getForDate).getMonth();
      let getWeatherYear = new Date(getForDate).getFullYear();

      let getForTemp = getForInfo[i * 7].main.temp;
      let getForHum = getForInfo[i * 7].main.humidity;

      let cardWeather = $("<div>").attr({
        class: "card bg-info shadow m-4 flex-container",
      });

      let cardBodyWeather = $("<div>").attr({ class: "card-body" });
      let iconURL = $("<img>").attr({
        src: "https://openweathermap.org/img/w/" + getIcon + ".png",
      });

      let weatherForDate = $("<p>").html(
        getWeatherMonth + "/" + getWeatherDate + "/" + getWeatherYear
      );

      let weatherIcon = $("<p>").append(iconURL);

      let weatherForTemp = $("<p>").html(
        "Temperature: " + getForTemp + "&deg" + "F"
      );
      let weatherForHum = $("<p>").html("Humidity: " + getForHum + "% <br>");

      cardBodyWeather.append(
        weatherForDate,
        weatherIcon,
        weatherForTemp,
        weatherForHum
      );

      cardWeather.append(cardBodyWeather);
      $("#weather-forecast").append(cardWeather);
    }
  });
}

function saveCity() {
  localStorage.setItem("citylist", JSON.stringify(cityArr));
}

showSavedData();
