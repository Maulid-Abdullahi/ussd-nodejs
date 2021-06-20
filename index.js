//LIBRARIES
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = 8000;

//MODELS
// const user = require("./model/user");
const User = require("./model/user");

//MONGODB CONNECTION
const database_url = "mongodb://localhost:27017/ussd";
mongoose.connect(database_url);
const db = mongoose.connection;

//ERROR
db.on("error", (err) => {
  console.log(err);
});
//RUNNING
db.once("open", () => {
  console.log("Database is running");
});
//BODY PARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Success Message");
});

app.post("/", (req, res) => {
  const { phoneNumber, text, sessionId } = req.body;
  let response;

  if (text === "") {
    response = "CON Enter your first name";
  }
  if (text !== "") {
    //SPLIT STRINGS IN TEXT USING ARRAY
    let array = text.split("*");
    if (array.length === 1) {
      response = "CON Enter your id number";
    } else if (array.length === 2) {
      //ID NUMBER
      if (parseInt(array[1]) > 0) {
        response =
          "CON Please confirm if you want to save the data\n1. Confirm\n2. Cancel\n3. View All Users";
      } else {
        response = "END Network error. please try again.";
      }
    } else if (array.length === 3) {
      //   console.log('fullname',array[0]);
      //   console.log('id_number',array[1]);
      if (parseInt(array[2]) === 1) {
        let data = new User();
        data.fullname = array[0];
        data.id_number = array[1];
        data.save(() => {
          response = "END Your data was saved successfully.";
        });
      } else if (parseInt(array[2]) === 2) {
        response = "END Sorry, data was not saved.";
      }
      //FETCHING USERS FROM DB
      else if (parseInt(array[2]) === 3) {
        User.find({}, (err, users) => {
          console.log("users", users);
          let users_data = `${
            users.length < 1
              ? `No data found`
              : `${users.map((item, index) => {
                  return `${index + 1}. ${item.fullname}\n`;
                }).join('')
            }`
          }`;
          response = `END Current users.\n${users_data}`;
        });
      } else {
        response = "END Invalid input.";
      }
    } else {
      response = "END Network Error Please try agin";
    }
  }

  setTimeout(() => {
    console.log("text", text);
    res.send(response);
    res.end();
  }, 2000);
});

app.listen(PORT, () => {
  console.log("app is running on port " + PORT);
});
