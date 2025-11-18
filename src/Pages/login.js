import React, { useState, useEffect } from "react";
import axios from 'axios';
import { encryptData } from "../Components/adminEncrypt";

// SQL via SSH
// https://dev.to/itsakankxa/node-js-how-to-access-mysql-remotely-using-ssh-heo

export default function Login(props){
  props.funcNav(false); //remove nav bar 
  
  //variables that store login data 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  //variable for error handling
  const [logInError, setlogInError] = useState('');
  let responseVal = "0";  

  //function that processes submition of login form - called when Log In clicked
  const handleSubmit = async (event) => {
    event.preventDefault();

    // send logIn api call to the nodeJs backend 
    try { //Handle Success
      const response = await axios.post('/api/logIn', {userName: username, password: password});
      responseVal = response.data;
    } catch (error) {
      console.error('Error sending user information: ', error);
    }
    //check the server response to see if log in was successful or not 
    accountApproval(responseVal);
  }

  const checkAdminStatus = async (username, password) => {
    try {
      const adminResponse = await axios.post('/api/getAdmin', { 
        userName: username, 
        password: password 
      });
      return adminResponse.data;
    } catch (error) {
      console.error('error getting admin status');
      return false;
    }
  }

  //check the login return value to see if it was a success
  async function accountApproval(){
    if(responseVal == "1"){ // account creation was successful 
      setlogInError(false);
      const loggedIn = true;
      //store important values in session cookies for use on other pages - possible vulnerabilities 
      sessionStorage.setItem('Status', loggedIn); 
      sessionStorage.setItem('account', username);
      sessionStorage.setItem('key', password);
      const admin = await checkAdminStatus(username, password);
      sessionStorage.setItem('admin', encryptData(admin));
     
      //TODO: Pop-up window saying "welcome"

      //transition to homepage on success 
      setTimeout(function() {
        window.location.href = "/";
      }, 500);
    }else{ // account creation wasn't successful 
      setlogInError(true);
    }
  }

  return(
    <div id="vertical">
      <div class="center">
        <h1 style={{textAlign:"center", fontSize:"xlarge", paddingTop:"15px"}}> Virtual Makerspace Log In </h1>
          <div id="leftCol">
            <img src="images/cover-image.svg" alt="People Building" className="imgCartoon"/>
          </div>
         <div id="rightCol">
            <form class="form loginform" id="loginform" onSubmit={handleSubmit} enctype="text/plain">
              {logInError && <div className="falseLogIn"> No user found with these credentials. </div>}
              <label>
                Username:
                <input type="text" value={username} subject="Username" placeholder=" username" 
                onChange={(e) => {setUsername(e.target.value); setlogInError(false)}} required/>
              </label>

              <label>
                Password:
                <input type="password" value={password} placeholder=" password" 
                onChange={(e) => {setPassword(e.target.value); setlogInError(false)}} required/>
              </label>
  
              <input type="submit" value="Log In" />
            </form>
            {/* if user doesn't have an account they can navigate to sign up page */}
            <p style={{ textAlign: "center", padding: "1%" }}> Don't have an account? <a href="/signUp"> Sign Up</a> </p>
          </div>
      </div>
    </div>
  );
}