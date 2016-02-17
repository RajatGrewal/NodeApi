/**
 * Created by mi0152 on 02/02/16.
 */
 /***********
  * "pair" has been added manually in the badwords.csv
  * just to check whether the profanity scanner works or not
  * Make sure to remove it.
  ***********/

//DEPENDENCIES
var express = require('express');
var http = require("http");
var app = express();
var superagent = require('superagent');
var Profanity_Scanner = require("profanity-scanner");
var mongoose = require("mongoose");
var dataSaver = require("/Users/mi0152/IdeaProjects/NodeApi/model/model.js");
var pf = new Profanity_Scanner();


//URL that needs to be hit
url = "http://developer.myntra.com/forum/feed";


//connecting to local database
mongoose.connect("mongodb://localhost/spamAssassin");


//Declaring dat as a global variable
var dat = "";
var res1= "";


//Storing the JSON data available on the website in var "dat"
var request = http.get(url, function (response) {

    var buffer = "",
        data;


    response.on("data", function (chunk) {
        buffer += chunk;
    });


    response.on("end", function (err) {
        //console.log(buffer);
        console.log("\n");
        dat = JSON.parse(buffer);
    });


    //uncomment to print out the entire json data
    //console.log(dat);
});


app.get('/api/*', function(req, res){

    var test = req.url;


    console.log("===========================================================================");
    console.log("The url typed was: " + test);          //printing the url that was typed

    var add = req.url.substr(5, req.url.length-4);



    superagent.get('developer.myntra.com/'+add).end( function(err, result){


        res1 = JSON.parse(result.text);
        res.send((res1));
        var answerCount =0;


        if (add.match(/\/answers/)) {
            console.log('searching the answers!');

            res1.data.answers.forEach(function(){
                console.log("Search Type : ANSWER");
                func(res1.data.answers[answerCount]);
                console.log("***************************************************************");
                answerCount++;
            });
        }
        else {
            console.log("Search type : QUESTION");
            func(res1.data);
        }
    })
});



//just a random check
app.get('/temp/', function(req, res) {
    console.log('temp');
    res.json({
        "message" : 'Successfully working!'
    });
});



//App listening at port 8081
var server = app.listen(8081, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("App listening at http://%s:%s", host, port);

});


function func(resData){
    var index = 0;

    //Checking which element in the description corresponds to TEXT
    //By default in the API its 0
    while(resData.description[index].type !== "TEXT"){
        index++;
    }

    console.log("Content : ");
    console.log(resData.description[index].value);
    console.log("***************************************************************");
    console.log("Checking post for obscenity! ");

    //Checking the post for profanity
    if(pf.scan(resData.description[index].value)) {
        console.log("Profanity Found! Storing value in our local database. Your post needs to be moderated ");


        //Storing and saving it in our local database
        var spam = new dataSaver();
        spam.type = resData.type;
        spam.id = resData.id;
        spam.value = resData.description[index].value;
        spam.isSpammed = true;

        //saving the values in the database
        spam.save(function(err){
            if(err)
                res.send(err);
            else
                console.log("Data saved successfully!!");
        });

    }
    else
        console.log("No profanity found. Posting!");

    console.log("***************************************************************");
}