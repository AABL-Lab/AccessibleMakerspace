import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Toaster, toast } from 'sonner';

export default function SignUp(props) {
  if (props.funcNav) {
    props.funcNav(false); 
  }

  // variables used for data storage
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifiedPassword, setVerifiedPassword] = useState('');
  const [email, setEmail] = useState('');
  
  // variables used for error handling 
  const [passwordError, setPasswordError] = useState('');
  const [userExistsError, setUserExistsError] = useState('');
  const [showTooltip, setShowTooltip] = useState(false); //todo - not implemented
  
  // function that processes submission of login form
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Reset errors before checking
    setPasswordError('');
    setUserExistsError('');

    // if the user's credentials don't match approved structure, stop account creation process
    if (!verifyInfo(password, verifiedPassword, email)){
      return;
    }

    // send signup api call to the nodeJs backend 
    try {
      const response = await axios.post('/api/signUp', {
        userName: username, 
        password: password, 
        email: email
      });
      
      // Pass the response data directly to the approval handler
      accountApproval(response.data);
    } catch (error) {
      console.error('Error sending user information: ', error);
      toast.error('An error occurred while communicating with the server.');
    }
  }

  // function that validates passwords and email format
  function verifyInfo(password, verifiedPassword, email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Password Validation Regex Patterns
    const capitalLetterRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>\-_]/; 

    if (password.length < 8) {
      const errorMsg = 'Password must be at least 8 characters long';
      setPasswordError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    if (!capitalLetterRegex.test(password)) {
      const errorMsg = 'Password must contain at least one capital letter';
      setPasswordError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    if (!numberRegex.test(password)) {
      const errorMsg = 'Password must contain at least one number';
      setPasswordError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    if (!specialCharRegex.test(password)) {
      const errorMsg = 'Password must contain at least one special character';
      setPasswordError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    if (password !== verifiedPassword) {
      const errorMsg = 'Passwords do not match';
      setPasswordError(errorMsg);
      toast.error(errorMsg);
      return false;
    } 

    return true;
  }

  // check the signUp return value to see if it was a success
  function accountApproval(resVal) {
    if (resVal == "1") { // account creation was successful 
      toast.success(`Welcome, ${username}! Account created successfully.`);
      
      const isSignedUp = true; 
      sessionStorage.setItem('Status', isSignedUp); 
      sessionStorage.setItem('account', username);
      
      setTimeout(function() {
        window.location.href = "/";
      }, 1500);

    } else if (resVal == "2") { // account creation wasn't successful 
      const errorMsg = "A user with these credentials already exists.";
      setUserExistsError(errorMsg);
      toast.error(errorMsg);
    }
  }

  return (
    <div id="vertical">
      <Toaster richColors position="top-center" />
      
      <div className="center">
        <h1 style={{textAlign:"center", fontSize:"xlarge", paddingTop:"10px"}}> 
          Makerspace Sign Up
        </h1>
        <div id="leftCol">
          <img src="images/cover-image.svg" alt="People Building" className="imgCartoon"/>
        </div>
        <div id="rightCol" style={{marginTop:"0"}}>
          {passwordError && <div style={{paddingLeft:"12px", color:"red"}}>{passwordError}</div>}
          {userExistsError && <div style={{paddingLeft:"12px", color:"red"}}>{userExistsError}</div>}
          
          <form className="form loginform signUp" id="signUpform" onSubmit={handleSubmit}>
            <label>
              Username:
              <input 
                type="text" 
                value={username} 
                placeholder=" username" 
                onChange={(e) => setUsername(e.target.value)}  
                required 
              />
            </label>
            <label>
              Email:
              <input 
                type="email" 
                value={email} 
                placeholder=" email" 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </label>
            <label>
              Password (8 characters minimum):
            </label>
            <input 
              type="password" 
              className={passwordError ? 'error' : ''} 
              value={password} 
              placeholder=" password"  
              minLength="8" 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            /> 
            <label>
              Confirm Password:
            </label>
            <input 
              type="password" 
              className={passwordError ? 'error' : ''} 
              value={verifiedPassword} 
              placeholder=" confirm password" 
              onChange={(e) => setVerifiedPassword(e.target.value)} 
              required 
            />
            <input type="submit" value="Sign Up" />
          </form>
        </div>
      </div>
    </div>
  );
}