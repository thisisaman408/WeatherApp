const express = require("express");
const https = require("https");
const fs = require("fs");
const id = "81f35bc5475c4e209e2162754240311";
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const dataPathn = __dirname + "/weather.json";
const path = JSON.parse(fs.readFileSync(dataPathn, "utf-8"));
// Serve the HTML file when a GET request is made to the root route.
app.get("/", (req, res) => {
  // Serve the HTML file first
  res.sendFile(__dirname + "/index.html");
});

//we will accept the city name from this html file, usin post method
app.post("/", (req, res) => {
  //we added the body parser, which helps us to interact with the index.html file
  //we will now use the name of the input field in the html file to get the value of the city name
  const cityName = req.body.cityName;

  // Construct the URL to get the latitude and longitude of the city
  const url = `https://api.weatherapi.com/v1/current.json?key=${id}&q=${cityName}`;

  // Make a GET request to the first API
  https
    .get(url, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        try {
          const temp = JSON.parse(data);
          const aman = temp.current.temp_c;
          const weatherDescription = temp.current.condition.text;
          const iconCode = temp.current.condition.code;
          const cityRegion = temp.location.region;
          const cityCountry = temp.location.country;
          const timezone = temp.location.tz_id;
          const localTime = temp.location.localtime;
          var day = "";
          const is_day = temp.current.is_day;
          if (is_day === 1) {
            day = "day";
          } else {
            day = "night";
          }
          let iconMain = "";
          for (let x of path) {
            if (x.code === iconCode) {
              iconMain = x.icon;
              break;
            }
          }
          const imageurl = `https://cdn.weatherapi.com/weather/64x64/${day}/${iconMain}.png`;
          const htmlContent = `
              <div style='text-align: center;'>
                <img src="${imageurl}" alt="Weather icon">
                <h1>${cityName}</h1>
                <h1>${cityRegion}</h1>
                <h1>${cityCountry}</h1>
                <h1>${timezone}</h1>
                <h1>${localTime}</h1>
                <p>The weather description of ${cityName} is: ${weatherDescription}</p>
                <h1>Temperature: ${aman} Celsius</h1>
              </div>`;
          res.write(htmlContent);
          res.end();
        } catch (error) {
          res.status(500).send("Error parsing weather data");
        }
      });
    })
    .on("error", (err) => {
      res.status(500).send("Error fetching weather data");
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
