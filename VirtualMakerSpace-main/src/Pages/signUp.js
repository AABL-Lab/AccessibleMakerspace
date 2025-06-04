import React, { useState, useEffect } from "react";
import axios from 'axios';

export default function SignUp(props) {
  props.funcNav(false); // hides navigation bar 
  // variables used for data storage
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifiedPassword, setVerifiedPassword] = useState('');
  const [email, setEmail] = useState('');
  // variables used for error handling 
  const [passwordError, setPasswordError] = useState('');
  const [userExists, setUserExistsError] = useState('');
  
  const [showTooltip, setShowTooltip] = useState(false); //todo - not implemented
  
  let responseVal = 0;  
  
  //function that processes submition of login form - called when Sign Up clicked
  const handleSubmit = async (event) => {
    event.preventDefault();
    //if the user's credentials doesn't match approoved structure then stop account creation process
    if (!verifyInfo(password, verifiedPassword, email)){
      return;
    }

    // send signup api call to the nodeJs backend 
    try {
      const response = await axios.post('/api/signUp', {userName: username, password: password, email: email});
      responseVal = response.data;
    } catch (error) {
      console.error('Error sending user information: ', error);
    }
    //check the server response to see if sign up was successful or not 
    accountApproval(responseVal);
  }

  // function that validates the user's passwords meet standard format (capital letter, number etc.), 
  // verify passwords match & email 
  function verifyInfo(password, verifiedPassword, email){
    // Validate password
    const capitalLetterRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;

    if (!capitalLetterRegex.test(password)) {
      setPasswordError('Password must contain at least one capital letter');
      return false;
    }

    if (!numberRegex.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }

    if (password != verifiedPassword) {
      setPasswordError('Passwords do not match');
      return false;
    } 

    //TODO: Email Verification

    return true;
  }

  //check the signUp return value to see if it was a success
  function accountApproval(){
    if(responseVal == "1"){ // account creation was successful 
      //TODO: Pop-up saying "welcome" 
      const isSignedUp = true; 
      sessionStorage.setItem('Status', isSignedUp); 
      sessionStorage.setItem('account', username);
      sessionStorage.setItem('key', password);
      
      //transition to homwpage on success 
      setTimeout(function() {
        window.location.href = "/";
      }, 500);
    }else if(responseVal == "2"){ // account creation wasn't successful 
      setUserExistsError("A user with these credentials already exist.");
    }
  }

  return(
    <div id="vertical">
      <div class="center">
        <h1 style={{textAlign:"center", fontSize:"xlarge", paddingTop:"10px"}}> Makerspace Sign Up</h1>
          <div id="leftCol">
            <img src="images/cover-image.svg" alt="People Building" className="imgCartoon"/>
          </div>
         <div id="rightCol" style={{marginTop:"0"}}>
          {/* {passwordError &&<h2></h2>} */}
          {passwordError && <div style={{paddingLeft:"12px",color:"red"}}>{passwordError}</div>}
            <form class="form loginform signUp" id="signUpform" onSubmit={handleSubmit} >
              <label>
                Username:
                <input type="text" value={username} placeholder=" username" onChange={(e) => setUsername(e.target.value)}  required/>
              </label>
              <label>
                Email:
                <input type="text" value={email} placeholder=" email" onChange={(e) => setEmail(e.target.value)} required/>
              </label>
              {/*  onChange={(e) => setPassword(e.target.value)}onMouseLeave={() => setShowTooltip(false)} */}
              <label>
                Password (8 characters minimum):
              </label>
                {/* todo: add toolTips for password format onClick={() => setShowTooltip(true)} */}
                <input type="password" className={passwordError ? 'error' : ''} value={password} placeholder=" password"  minLength="8" 
                onChange={(e) => setPassword(e.target.value)} required/> 
              
              {/* Todo: not implemented but can help user's understand proper structure */}
              {/* {showTooltip && (
                <div className="tooltip">
                  <h1> here </h1>
                  <ul>
                    <li>At least 8 characters long</li>
                    <li>At least one capital letter</li>
                    <li>At least one number</li>
                    <li>Optional: special characters</li>
                  </ul>
                </div>
              )} */}
              <label>
                Confirm Password:
              </label>
              <input type="password" className={passwordError ? 'error' : ''} value={verifiedPassword} placeholder=" confirm password" onChange={(e) => setVerifiedPassword(e.target.value)} required/>
              <input type="submit" value="Sign Up" />
            </form>
          </div>
      </div>
    </div>
  );
}