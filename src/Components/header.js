import React, { useState, useEffect } from "react";

export default function Header() {
  const [userSignIn, setUserSignIn] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [username, setUsername] = useState(""); 

  useEffect(() => {
    const isUserLoggedIn = sessionStorage.getItem('Status') === 'true';
    setUserSignIn(isUserLoggedIn);
    
    if (isUserLoggedIn) {
      const storedName = sessionStorage.getItem('account');
      setUsername(storedName || "User"); 
    }
  }, []);

  const handleUploadProjectClick = () => {
    if (!userSignIn) {
      // Show popup for sign-in
      setShowSignInPopup(true);
    }
  };

  const closePopup = () => {
    setShowSignInPopup(false);
  };

  function handleLogOut() {
    sessionStorage.clear();
    window.location.href = "/";
  }

  return (
    <header aria-labelledby="related-nav-heading" role="banner">
      <div className="left-container">
        <div className="logo">
          <a href="/">
            <img src="https://cdn.glitch.global/fdf75b2b-7e9a-4bb3-986a-bd88e96d179a/logo.png?v=1687373287862" alt="Website Logo" />
          </a>
        </div>
      </div>
      <div className="top-header-container">
        <nav>
          {userSignIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="user-greeting" style={{ fontWeight: 'bold' }}>
                Hello, {username}
              </span>

              <a href="/projectUpload">
                <button type="button" onClick={handleUploadProjectClick}> Upload Project +</button>
              </a>
              
              <a href="/userPage" onClick={() => {
                sessionStorage.setItem("selectedUserId", sessionStorage.getItem("account"));
              }}>
                <img src="images/Profile_Icon.png" className="profile-picture" alt="User Profile" />
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