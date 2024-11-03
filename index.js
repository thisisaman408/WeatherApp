// Importing the express module to create an Express application.
const express = require("express");
// Creating an instance of the Express application.
const app = express();
// Importing the https module to make HTTP requests.
const https = require("https");
// Your OpenWeatherMap API key for accessing weather data.
const id = "3c543a03941d84d6c18967126921a5c3";
// Defining the port number for the server to listen on.
const port = 3000;

// Setting up a GET route for the root URL ("/").
app.get("/", (req, res) => {
  // Defining the city for which we want to get the weather data.
  const cityName = "Chennai";
  // Constructing the URL to get geographical data for the specified city.
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${id}`;

  // Making a GET request to the OpenWeatherMap geo API to retrieve the city location.
  https
    .get(url, (response) => {
      // Variable to accumulate the data received from the API.
      let data = "";

      // The 'data' event is triggered whenever a chunk of data is received.
      response.on("data", (chunk) => {
        data += chunk; // Append each chunk to the data variable.
      });

      // The 'end' event is triggered when all data has been received.
      response.on("end", () => {
        try {
          // Parsing the accumulated data from JSON format.
          const weatherData = JSON.parse(data);
          // Extracting latitude and longitude from the parsed data.
          const latitude = weatherData[0].lat;
          const longitude = weatherData[0].lon;
          // Constructing the second API URL using the retrieved latitude and longitude.
          const url2 = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${id}&units=metric`;

          // Making a second GET request to fetch the weather data for the city.
          https
            .get(url2, (resp) => {
              // Variable to accumulate the weather data.
              let tempData = "";

              // The 'data' event for the weather data response.
              resp.on("data", (chunk) => {
                tempData += chunk; // Append each chunk to the tempData variable.
              });

              // The 'end' event for the weather data response.
              resp.on("end", () => {
                try {
                  // Parsing the weather data received from the second API call.
                  const temp = JSON.parse(tempData);
                  // Extracting the current temperature from the parsed data.
                  const aman = temp.current.temp;
                  // Extracting the weather description.
                  const weatherDescription =
                    temp.current.weather[0].description;
                  // Extracting the icon code to display the weather icon.
                  const icon = temp.current.weather[0].icon;
                  // Constructing the URL for the weather icon.
                  const imageurl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

                  // Building the HTML response to send back to the client.
                  res.write("<div style='text-align: center;'>"); // Centering the content.
                  res.write(`<img src="${imageurl}" alt="Weather icon">`); // Adding the weather icon image.
                  res.write(
                    `<p>The weather description of ${cityName} is: ${weatherDescription}</p>`
                  ); // Displaying the weather description.
                  res.write(`<h1>Temperature: ${aman} Celsius</h1>`); // Displaying the current temperature.
                  res.write("</div>"); // Closing the div element.
                  res.end(); // Finalizing the response and sending it to the client.
                } catch (error) {
                  // Handling errors in parsing the weather data.
                  console.log("Error parsing weather data");
                  res.send("Error parsing weather data"); // Sending an error response.
                }
              });
            })
            .on("error", (err) => {
              // Handling any errors that occur during the weather data request.
              res.send("Error fetching weather data");
            });
        } catch (error) {
          // Handling errors in parsing the location data.
          console.log("Error parsing location data");
          res.send("Error parsing location data"); // Sending an error response.
        }
      });
    })
    .on("error", (err) => {
      // Handling any errors that occur during the location data request.
      res.send("Error fetching location data");
    });
});

// Starting the server to listen on the defined port.
app.listen(port, () => {
  console.log(`Server is running on port ${port}`); // Log message indicating the server is running.
});
