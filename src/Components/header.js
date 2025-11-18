import React,  { useState, useEffect } from "react";

export default function Header() {
  const [userSignIn, setUserSignIn] = useState(false); 
  const [showSignInPopup, setShowSignInPopup] = useState(false);

  useEffect(() => { 
    setUserSignIn(sessionStorage.getItem('Status') === 'true');
    console.log(userSignIn); 
  },[]);

  const handleUploadProjectClick = () => {
    if (!userSignIn) {
      // Show popup for sign-in
      setShowSignInPopup(true);
    }
  };

  //if user is logged in the they uplad a project 
  const closePopup = () => {
    setShowSignInPopup(false);
  };

  //if user clicks logout then clear rhe sessionStorage 
  function handleLogOut(){
    sessionStorage.clear();
    window.location.href = "/";
  }

  return (
    // makes the right section of header 
    <header aria-labelledby="related-nav-heading" role="banner">
      <div class="left-container">
        <div class="logo">
          <a href="/">
            <img src="https://cdn.glitch.global/fdf75b2b-7e9a-4bb3-986a-bd88e96d179a/logo.png?v=1687373287862" alt="Website Logo" />
          </a>
        </div> 
      </div>
      <div class="top-header-container">
        <nav>
          {userSignIn ? (
            <div>
              <a href="/projectUpload">
                <button type="button" onClick={handleUploadProjectClick}> Upload Project +</button>
              </a>
              <a href="/userPage" onClick={() => { 
                sessionStorage.setItem("selectedUserId", sessionStorage.getItem("account"));
                }}>
                <img src="images/Profile_Icon.png" className="profile-picture" alt="A Robot" />
              </a>
              <a href="#" onClick={handleLogOut}>Log Out</a>
            </div>
          ) : (
            <div>
              <button type="button" onClick={handleUploadProjectClick}>Upload Project +</button>
              <a href="/login">Log In</a>
              <a href="/signUp">Sign Up</a>
            </div>
          )}
        </nav>
      </div>

      {/* Popup that ensures users are loged in before uplaoding a project */}
      {showSignInPopup && (
        <div className="modal-overlay">
          <div className="popup">
            <p>Please sign in to upload a project!</p>
            <button onClick={closePopup}>Close</button>
            <a href="/login">
              <button>Log In</button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
