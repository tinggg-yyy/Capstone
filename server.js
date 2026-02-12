const express = require("express");
// const http = require("http"); // we try to make HTTPS work

const https = require("https");
// to read certificates from the filesystem (fs)
const fs = require("fs");

const app = express(); // the server "app", the server behaviour


const portHTTPS = 3000; // port for https
// const portHTTP = 3001; // port for http

// returning to the client anything that is
// inside the public folder
app.use(express.static("public"));
// app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// array for all profiles
let profiles;

// this tries to load all the messages from the file
// messages.json - if this fails, we start with an
// empty array for messages
try {
  let data = fs.readFileSync("profiles.json");
  profiles = JSON.parse(data);
  console.log("Loaded profiles");
} catch (e) {
  profiles = [];
}

app.get("/profiles", function (req, res) {
  // this function is being called whenever the server
  // receives a HTTP GET request for /profiles
  // - it returns all messages (in JSON format)
  res.json(profiles);
});

app.post("/profiles", function (req, res) {
  // this function is being called whenever the server
  // receives a HTTP POST request for /profiles
  // - the data the client sent is in req.body
  console.log(req.body);
  let profile = req.body;
  // let's add some additional information
  profile.date = new Date().toISOString();
  profile.id =
    profiles.length > 0 ? Math.max(...profiles.map((p) => p.id)) + 1 : 1;

  // add it the messages array
  profiles.push(profile);
  // and save all current messages to a file (for permanence)
  fs.writeFileSync("profiles.json", JSON.stringify(profiles, null, 2));
  // its a good practice return the final message to the client
  res.json(profile);
});

// Creating object of key and certificate
// for SSL
const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};

// Creating servers and make them listen at their ports:
https.createServer(options, app).listen(portHTTPS, function (req, res) {
  console.log("HTTPS Server started at port", portHTTPS);
});

// if we ALSO serve on http we can incommend this, but right now we don't
// http.createServer(app).listen(portHTTP, function (req, res) {
//     console.log("HTTP Server started at port", portHTTP);
// });
