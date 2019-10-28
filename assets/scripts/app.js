$(function() {
  // load the widget configuration
  var config = new WidgetConfig();
  config.on("config-initialized", function(event, data) {
    //$("#output").text(config.preferences["Article Number"]);
    //load the page
    $.get(
      "https://api.weather.gov/stations/" +
        config.preferences["Station"] +
        "/observations/latest",
      "",
      function(data, textStatus, jqXHR) {
        $("#temp").html(cToF(data.properties.temperature.value) + "&deg;");
        $("#status").text(data.properties.textDescription);
      }
    );
  });
  config.on("config-error", function() {
    $("#output").text("Error loading preferences");
  });
  config.init();
});

function cToF(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}
