function WidgetConfig() {
  var self = this;
  self.preferences = {};

  self.init = function() {
    // load the config.xml file
    $.ajax("config.xml", { dataType: "xml" })
      .done(function(xmlData) {
        try {
          parseWidgetPreferencesXml(xmlData);

          self.trigger("config-initialized", null);
        } catch (e) {
          console.log(e);
          self.trigger("config-error", null);
        }
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
        self.trigger("config-error", null);
      });
  };

  function parseWidgetPreferencesXml(xmlDoc) {
    //Get the widget width and height
    var widgetNode = xmlDoc.getElementsByTagName("widget")[0];

    //Load the preferences
    var preferenceElements = xmlDoc.getElementsByTagName("preference");

    if (preferenceElements != null) {
      for (var i = 0; i < preferenceElements.length; i++) {
        var preference = preferenceElements[i];
        //PREFERENCE TYPE DOES NOT SEEM TO PASS THROUGH TO THE WIDGETS ANYMORE.
        //var preferenceType = preference.attributes["sl:type"].value;
        /*if (preferenceType == "boolean") {
          var value = preference.attributes["value"].value;
          if (value.toLowerCase() == "true") {
            value = true;
          } else {
            value = false;
          }
          self.preferences[preference.attributes["name"].value] = value;
        } else {*/
        self.preferences[preference.attributes["name"].value] =
          preference.attributes["value"].value;
        //}
      }
    }
  }
}
WidgetConfig.prototype = Object.create(EventEmitter.prototype);
