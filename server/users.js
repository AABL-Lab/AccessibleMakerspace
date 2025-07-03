const { client, Connection } = require('pg');

const {connect, filter_content, validateUser, getUserID} = require('./server');
// const { query } = require('express');
// const { FOCUSABLE_SELECTOR } = require('@testing-library/user-event/dist/utils');
const bcrypt = require('bcryptjs');


// skills = ["Coding", "CAD"]

// Remove Trailing Spaces
// Logs in a given user
async function logIn(client, userName, Password){
  // console.log("Loggin in User: " + userName);
  try{
    userName = filter_content(userName).trim();
    Password = filter_content(Password).trim();
    let valid = await validateUser(client, userName, Password);
    if (valid){
      return valid;
    }
    else{
      userID = await getUserID(client, userName);
      if (userID == -1){
        throw("Username does not exist");
      }
      else {
        passWordQuery = "SELECT password FROM users where userID = " + userID + ";";
        // console.log(passWordQuery)
        storedPassword = await client.query(passWordQuery);
        // console.log(storedPassword.rows);
        storedPassword = storedPassword.rows[0].password;
        if (storedPassword != Password){
          throw("Password does not match");
        }
      }
      throw ("Shit");
    }
  }
  catch(error){
    console.log("Log In Error: " + error);
    return error;
  }
}

// This creates a new user
async function createUser(client, userName, password, email){
    console.log("Creating User");
  
    try{
      if (typeof userName != 'string') {throw("Username is not a string")}
      if (typeof password != 'string') {throw("Password is not a string")}
      if (typeof email != 'string') {throw("Email is not a string")}
      // console.log("Type Checked");
      userName = filter_content(userName);
      // password = filter_content(password);
      password = await bcrypt.hash(password, 10);
      password = filter_content(password);
      email = filter_content(email);
      // console.log("Filtered Input\nPassword Type: " + typeof password);
  
      userQuestionMark = await client.query("SELECT username FROM users where username = '" + userName + "';");
      // console.log(userQuestionMark.rows[0]);
      if (userQuestionMark.rows[0] != undefined){
        if (userQuestionMark.rows[0].username == userName){
          return "User already exists";
        }
      }
      the_query = "INSERT INTO users (username, password, email) VALUES ('" + userName + "', '" + password + "',  '" + email + "')";
    
      // console.log(the_query);
    
      await client.query(the_query);
    
      users = await client.query('Select * from users');
      // console.log(users.rows);
      return 'YAY!!!';
    }
    catch(error){
      console.log("ERROR Creating User: " + error);
      return error;
    }
  }

// This edits a user
  async function editUser(client, userID, userName, passWord, displayName, bio, email){
    // let Status = 0
    // Add User Validation
    if (await validateUser(client, userName, passWord, userID) == true){
      try{
        if (userName != undefined){
          the_query = "UPDATE users SET username = '" + filter_content(userName) + "' where userid = " + userID + ";";
          // console.log(the_query);
          await client.query(the_query);
          // Status = (Status) * 10 + 1;
        }
      }
      catch (error){
        console.log("Error: " + error);
        return "username";
      }
      try{
        if (passWord != undefined){
          the_query = "UPDATE users SET password = '" + filter_content(await bcrypt.hash(passWord, 10)) + "' where userid = " + userID + ";";
          // console.log(the_query);
          await client.query(the_query);
        }
      }
      catch (error){
        console.log("Error: " + error);
        return "password";
      }
    
      try{
        if (displayName != undefined){
          the_query = "UPDATE users SET displayname = '" + filter_content(displayName) + "' where userid = " + userID + ";";
          // console.log(the_query);
          await client.query(the_query);
        }
      }
      catch (error){
        console.log("Error: " + error);
        return "displayname";
      }
    
      try{
        if (bio != undefined){
          the_query = "UPDATE users SET bio = '" + filter_content(bio) + "' where userid = " + userID + ";";
          // console.log(the_query);
          await client.query(the_query);
        }
      }
      catch (error){
        console.log("Error: " + error);
        return "bio";
      }
    
      try{
        if (email != undefined){
          the_query = "UPDATE users SET email = '" + filter_content(email) + "' where userid = " + userID + ";";
          // console.log(the_query);
          await client.query(the_query);
        }
      }
      catch (error){
        console.log("Error: " + error);
        return error;
      }
    }
    return "success";
  }

// This function gets all the projects that the user had created
  async function getUserProjects(client, userName){
    console.log("Getting Projects For User " + userName);
    try {
      userName = filter_content(userName)
      let userID = await getUserID(client, userName);
      // console.log(userID);
      if (userID == -1){
        throw("User Does Not Exist");
      }
      projectIDQuery = "SELECT * FROM projects WHERE userid = " + userID + ";";
      // console.log(projectIDQuery);
      results = await client.query(projectIDQuery);
      results = results.rows;
      // console.log(results);
      return results;
  
    }
    catch(error){
      console.log("Get User Projects Error: " + error);
      return error
    }
  }

  async function getUsers(client){
    try {
      let query = "SELECT username, displayname, bio FROM users WHERE displayname IS NOT NULL;";

      console.log(query);

      results = await client.query(query);

      // console.log(results.rows);

      return results.rows;
    }
    catch (error){
      console.log("ERROR: " + error);
      return false
    }
  }

// This function gets some important information when given a username
  async function getUserByName(client, userName){
    try {
      userName = filter_content(userName);
      let userID = await getUserID(client, userName);

      if (userID == -1){
        throw ("User Does Not Exist");
      }
      let query = "SELECT username, displayname, bio FROM users WHERE userid = " + userID + ";";

      // console.log(query);

      let result = await client.query(query);

      return result.rows[0];
    }
    catch (error){
      console.log(error)
      return error
    }
  }

// This function deletes a user
async function deleteUser(client, username, passWord, adminUsername) {
  try {
    if (typeof username != 'string') {throw ("Username Not String")}
    if (typeof passWord != 'string') {throw ("Password Not String")}
    if (typeof client != 'object') {throw ("Client Invalid Type")}
    userID = await getUserID(client, username);
    if (await validateUser(client, username, passWord, userID)) {
      let query = "DELETE FROM users WHERE userid = " + userID;
      // console.log(query);
      await client.query(query);
      return true;
    }
    throw("User Not Deleted");
  }
  catch (error){
    console.log("Delete User Error: " + error);
    return error;
  }

}

async function loginTest(Connection){
  console.log("Testing login");

  console.assert(await logIn(Connection, "JLawton10", "12345678910"));

  console.assert(await logIn(Connection, "JLawton10", "Fun") == "Password does not match");

  console.assert(await logIn(Connection, "Poop", "Fun") == "Username does not exist");

  console.assert(await logIn(Connection, "O'Brian", "Oh'fun"));

  console.assert(await logIn(Connection, "O'Brian", "Ohfun") == "Password does not match");

  // console.assert(await logIn(Connection, "OBrian", "Oh'fun") == "Username does not exist");
}

async function userProjectsTest(Connection){
  console.log("Testing User Projects");

  console.assert((await getUserProjects(Connection, "JLawton10")).length == 1);

  console.assert((await getUserProjects(Connection, "O'Brian")).length == 0);

  console.assert((await getUserProjects(Connection, "Billy")).length == 1);

  console.assert((await getUserProjects(Connection, "Butt Hole")) == "sad");
}

async function testGetUsers(Connection){

  console.log("Testing Get Users");

  console.log(await getUsers(Connection));

}

async function testGetUserByName(Connection){
  console.log("Testing Get User By Name");

  console.log(await getUserByName(Connection, "JLawton10"))

  // console.assert(await getUserByName(Connection, "JLawton10") == {username: 'JLawton10', displayname: 'Jake Lawton', bio: 'I am a CS Student at Tufts University'});

  console.assert(await getUserByName(Connection, "Poopie") == "User Does Not Exist")
}

async function testCreateUser(Connection){
  await createUser(Connection, "Jackw", "Hello There", "hellothere@kenobi.com");

  console.assert(await validateUser(Connection, "Jackw", "Hello There"));
  console.assert(!await validateUser(Connection, "Jackw", ""));
  console.assert(!await validateUser(Connection, "Poop", ""));


}

async function testDeleteUser(Connection){
  // await deleteUser(Connection, "Test9", "987654321Q");
  // if (!await deleteUser(Connection, "test2", "123")){throw("Delete User Test 2 Failed")}
  // if (!await deleteUser(Connection, "test3", "rrrrr")){throw("Delete User Test 3 Failed")}
  // if (!await deleteUser(Connection, "test4", "4r44")){throw("Delete User Test 4 Failed")}
  // if (typeof username != 'string') {throw ("Username Not String")}
  //   if (typeof passWord != 'string') {throw ("Password Not String")}
  //   if (typeof client != 'object') {throw ("Client Invalid Type")}

  await createUser(Connection, "Test1", "Password 1");
  if (await deleteUser("Connection", "Test1", "Password 1") != "Client Invalid Type") {throw("Client Invalid Type Failed")};
  if (await deleteUser(Connection, 1, "Password 1") != "Username Not String" ){throw("Username Invalid Type Failed")};
  if (await deleteUser(Connection, "Test1", 1) != "Password Not String"){throw("Password Invalid Type Failed")};

  if (!await deleteUser(Connection, "Test1", "Password 1")){throw("Delete User Test 1 Failed")};
  if (await deleteUser(Connection, "Fun", "Games") != "User Not Deleted"){throw("User Deleted Successfully")};
  if (await deleteUser(Connection, "eeeeee", "1222") != "User Not Deleted") {throw("User Deleted Successfully")};


}

async function main(){
    console.log("Hello World");
    let Connection = await connect();

    // let result = await createUser(Connection, "Jim Boy", "Morgan", "Jim@Boy.com");

    // console.log(result);

    // result = await Connection.query("select * from users;");

    // console.log(result.rows);

    // result = await editUser(Connection, 8, undefined, undefined, "Jom Boy Calloway", "Ruten Tuten", undefined);

    // console.log(result);

    // result = await Connection.query("select * from users;");

    // console.log(result.rows);

    // let result = await getUserID(Connection, "Jim Boy");

    // let result = await validateUser(Connection, "JLawton10", "12345678910");

    // console.log(result);

    // await createUser(Connection, "O'Brian", "Oh'Fun", "O'Brian@fun.edu");

    // await loginTest(Connection);

    // await userProjectsTest(Connection);

    // await testGetUsers(Connection);

    // await testGetUserByName(Connection);

    // await getUserProjects(Connection, "JLawton10");

    // console.log("Connection About to be terminated");

    // await testCreateUser(Connection);

    await testDeleteUser(Connection);

    Connection.end();

    return 0;
}

// main();

module.exports = {createUser, logIn, getUsers, getUserByName, deleteUser, getUserProjects};
