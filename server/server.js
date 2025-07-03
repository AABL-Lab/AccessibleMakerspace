// https://northflank.com/guides/connecting-to-a-postgresql-database-using-node-js
// https://node-postgres.com/apis/client
// https://devcenter.heroku.com/articles/connecting-heroku-postgres

// const { click } = require('@testing-library/user-event/dist/click');
// const { response, query } = require('express');
const { Client, Connection } = require('pg');
// const { flushSync } = require('react-dom');
const fs = require('fs');
const util = require('util');
const { Console } = require('console');
const readFileAsync = util.promisify(fs.readFile);
const bcrypt = require('bcryptjs')
// const {validateUser} = require('./users');
// require('dotenv').config();

// Linkes for user authentication
// https://swoopnow.com/user-authentication/
// https://vertabelo.com/blog/user-authentication-module/
// https://stackoverflow.com/questions/290951/best-practices-for-web-login-authentication
// https://www.geeksforgeeks.org/session-vs-token-based-authentication/

// This File if for the overal server functions
// I.E. anything that may be needed by multiple files
// An example of this is user validation
// Another Example is scrubbing usernames or IDs
console.log("Hello");

let globalTags = [];

function hashPassword(password){

}

// This function gets the global tags
function getGlobalTags(){return globalTags};
// This is the file path for the saved global tags
const filePath = "globalTags.txt";
// Set the global tags from the saved tags file
async function setGlobalTags(){
  try{
    data = await readFileAsync(filePath);
    data = data.toString();
    data = data.split('\n');
    if (data.length != 0){
      data.pop();
    }
    globalTags = data;
    return data;
    // console.log('Reading Finished');
  }
  catch (error){
    console.log("Error: " + error)
    return ["Math", "Robotics", "Coding", "CAD"].sort()
  }
}

// globalTags = setGlobalTags();
// setGlobalTags.then()
// globalTags.sort();
// globalTags = 
// console.log(globalTags);

// This function cleans an id passed as a string to contain only digits
function cleanId(ID){
  return ID.replace(/\D/g, '');
}

// need to check
// This Updated the global tags array and the file
function updateGlobalTags(list){
  // chenged = false;
  if (Array.isArray(list)){
    console.log("Update Global Tags");
    // console.log(globalTags);
    for (let i = 0; i < list.length; i++){
      // console.log()
      tag = list[i]
      if (typeof tag == 'string') {
        tag = tag.split('_')[0]
        if (!globalTags.includes(tag)){
          changed = true;
          console.log("List Items")
          console.log(list[i])
          console.log(tag)
          globalTags.push(tag);
          fs.appendFile(filePath, tag + "\n", (err) => {
            if (err){
              console.log("Error " + error)
              return
            }
            console.log("Tag: " + list[i] + " added to file.");
            })
        }
      }
    }
  }
  // return changed;
}

// This function converts a list to a string to be saved in the server
function listToString(strList){
  if (Array.isArray(strList)){
    let CSV = "";
    for (let i = 0; i < strList.length; i++){
      // console.log(i);
      if (typeof strList[i] == 'string'){
        // console.log(strList[i]);
        try {
          CSV += filter_content(strList[i]) + ",";
        }
        catch (error){
          console.log("listToString Error: " + error);
          return error;
        }
      }
    }
    if (CSV.length > 0){
      CSV = CSV.slice(0, -1)
    }
    return CSV;
  }
}

// This converts the string saved into the server to a list to send to the font end
function stringToList(CSV){
  if (typeof CSV == 'string'){
    let strings = CSV.split(',')
    strings = strings.map(str => str.split('_'))
    strings = strings.map(lst => {if (lst.length == 1) {lst.push('0')} return lst})
    console.log("Strings: ")
    console.log(strings)
    return strings;
  }
}

// This spaces out the commas in a stored string
function stringToSpacedString(CSV){
  if (typeof CSV == 'string'){
    return CSV.replace(/,/g, ', ');
  }
  else {
    throw("Split String Needs a String");
  }
}

// This gets the user id for a given username
async function getUserID(client, userName){
  try{
      let the_query = "SELECT userid FROM users where username = '" + userName + "';";
      // console.log(the_query);
      let userID = await client.query(the_query);
      if (userID.rows[0] == undefined){
        throw("User " + userName + " Does Not Exist");
      }
      // console.log(userID.rows[0].userid);
      userID = userID.rows[0].userid;
      return userID;
  }
  catch (error){
      console.log("Get User ID Error: " + error);
      return -1;
  }
}

// This validated if a user is an admin 
async function validateAdmin(client, userName, Password){
  let admin;
  try {
    userID = await getUserID(client, userName);
    // console.log("UserID: "+ userID);
    let query = "SELECT admin FROM users WHERE userid = " + userID;
    admin = await client.query(query);
    admin = admin.rows[0].admin;
    // console.log(admin);
    if (admin == 'y'){
      return true;
    }

    else {return false}
  }
  catch (error){
    console.log("Validating Admin Error: " + error)
    return false;
  }
}

// DO NOT FILTER PASSWORD BEFORE SENDING!!!
// This function validated that a use exista and the password is correct
// The neededID parameter is optional.  It will check if the ID of the given user matches the needed id.
// If any of the checks fails, the function returns false.  
// It only returns true, if the user is valid, the password matches and the users id matches the needed id if provided.
async function validateUser(client, userName, Password, neededID){
  console.log("Validating User");
  // console.log(userName)
  try {
    if (neededID != undefined && typeof neededID != 'number') {throw ("Needed ID is not an int or undefined")}
    let userID = await getUserID(client, userName);
    // console.log(userID);
    if (userID == -1){
      throw("User " + userName + " does not exist");
    }
    let passWordQuery = "SELECT password FROM users where userID = '" + userID + "';";
    // console.log(passWordQuery);
    storedPassword = await client.query(passWordQuery);
    storedPassword = storedPassword.rows[0].password;
    // console.log(storedPassword);
    // console.log(Password);
    Password = Password.trim();
    storedPassword = storedPassword.trim();
    if (Password == storedPassword || await bcrypt.compare(Password, storedPassword)){
      // console.log("Here");
      if (neededID != undefined){
        if (!(neededID == userID || (await validateAdmin (client, userName, Password)))){
          throw ("Username Mis Match")
        }
      }
      // console.log("Hash: " + await bcrypt.compare(Password, storedPassword));
      // console.log("Plain: " + Password == storedPassword);
      // console.log("User Loged In!!");
      return true;
    }

    else {
      // console.log("Returning False");
      return false;
    }

  }
  catch (error){
    console.log("Validate User Error: " + error);
    return false;
  }
}
// Connection URL: postgres://hglurgefpcidex:0211ccea126ef7b0ed0c1d3849a5e65b56d16d7b07ce413bf2d179e94b8e7345@ec2-3-218-243-246.compute-1.amazonaws.com:5432/d7v5katklfeaf7
// This function connects to the postgree server and returns the connection
async function connect() {
  console.log("Connection Function Started");
  const client = new Client({
    host: 'cb6d9bqd303o1l.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'u2at07d72nh951',
    password: 'p4692b2ff0affa7293a60cf873ad33b8f2e57c1f2a54356f5ee2c26586508b003',
    database: 'da725tikbjen67',
    // connectionString: "dbname=d7v5katklfeaf7 host=ec2-3-218-243-246.compute-1.amazonaws.com port=5432 user=hglurgefpcidex password=0211ccea126ef7b0ed0c1d3849a5e65b56d16d7b07ce413bf2d179e94b8e7345 sslmode=require",
    ssl:{
      rejectUnauthorized: false
    }
  });

  let fail = true;
  let timeout = 1000;
  while(fail == true){
    try{
      console.log("Attempting to Connect")
      await client.connect();
      console.log("Connected")
      fail = false;
    }
    catch(err){
      console.log("Connection Failed with Error: " + err);
      fail = false;
      setTimeout(() => {console.log("Waiting " + timeout + "ms"), timeout});
      timeout = timeout * 2
    }
  }
  
  console.log("Connection Established");
  return client;
}

// This filters the text passed into a query
function filter_content(text){
  if (typeof text != 'string'){throw("Filtering Not A String")};
  return text.replace(/'/g, "''");
}



async function testValidateUser(Connection){
  console.log("Testing User Validation");

  if (!(await validateUser(Connection, "JLawton10", "12345678910"))) {throw("User Validated Unsuccessfully Test 1")}

  if ((await validateUser(Connection, "JLawton10", "Buns"))) {throw("User Invalidated Unseccessfully Test 1")}

  console.assert(! (await validateUser(Connection, "Poop", "Hello There")));

  if (!(await validateUser(Connection, "Jackw", "$2a$10$0r8JdwJ1R6e5.ds57VWdt.I32oyXt4.mdmykDrIgUbAVHFbScYFRO"))) {throw("User Validated Unsuccessfully")};

  if (!(await validateUser(Connection, "Jim Boy", "Morgan", 8))) {throw("User Validated Unsuccessfully Test 2")}

  if ((await validateUser(Connection, "Jim Boy", "Morgan", 1))) {throw("User Invalidated Unsuccessfully Test 2")}

  if (!(await validateUser(Connection, "JLawton10", "12345678910", 8))) {throw("User Validated Unsuccessfully Test 3")}

  if (!(await validateUser(Connection, "JLawton10", "12345678910", 1))) {throw("User Validated Unsuccessfully Test 4")}





}

async function testValidateAdmin(Connection){
  console.log("Testing Validate Admin")

  if (!(await validateAdmin(Connection, "JLawton10","12345678910"))) {throw ("Admin Not Valid")}

  if ((await validateAdmin(Connection, "O''Brian","Oh''Fun"))) {throw ("Admin Not Valid")}

}

async function main(){

  console.log("Hello World");

  let Connection = await connect();

  await testValidateUser(Connection);

  result = updateGlobalTags(["Hello_1", "There'_2", 17]);
  
  result = listToString(["Hello_1", "There'_2", 17, "GoodBye"]);

  console.assert(result == "Hello_1,There''_2");

  console.log(listToString([1, 2, 3]));

  console.log(stringToList(result));

  console.log(stringToList(""));

  await setGlobalTags();

  console.log(globalTags);

  await testValidateAdmin(Connection);

  
  password = "LENNYYYYYYYYYYYY";
  let hash = await bcrypt.hash(password, 10);
  console.log(await bcrypt.compare("password", hash));
  console.assert(await bcrypt.compare(password, hash));
  console.log(hash);
  console.log(hash.length);
  console.log(typeof Connection);
  console.assert(typeof Connection == 'object')
  console.log(typeof undefined);
  // console.log(Connection);
  console.assert(typeof undefined == 'undefined')
  // console.log(typeof []);
  Connection.end();

  const image = [1, 2, 3, 4, 5, 6]

  for (const int in image){
    console.log(int);
  }

  console.log("".split("_"))

  return 0;

}

// main();

module.exports = {connect, filter_content, validateUser, getUserID, cleanId, listToString, stringToList, stringToSpacedString, updateGlobalTags, setGlobalTags, getGlobalTags};
