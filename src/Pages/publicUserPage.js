import React, { useState, useEffect } from "react";
import ProjCard from "../Components/projCard";
import axios from 'axios';

// Public user profile component - displays profile without edit functionality
export default function PublicUserProfile() {
  const [profilePic, setProfilePic] = useState(null); 
  const [displayName, setDisplayName] = useState("User");  
  const [bio, setBio] = useState("No bio available");
  const [userId, setSelectedUserId] = useState("");
  const [userData, setUserData] = useState("");
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Retrieve the selected user's ID from sessionStorage or URL params
  useEffect(() => {
    const selectedUserId = sessionStorage.getItem("selectedUserId") || 
                          new URLSearchParams(window.location.search).get("userId");
    setSelectedUserId(selectedUserId);
    
    if (selectedUserId) {
      fetchUserData(selectedUserId);
      getPublicProjects(selectedUserId);
    } else {
      setError("No user selected");
      setLoading(false);
    }
  }, []);

  // Function to get user's projects using existing API
  async function getPublicProjects(user) {
    try {
      const response = await axios.post(`api/getUserProjects`, { username: user });
      setUserProjects(response.data);
    } catch (error) {
      console.log("Getting User Projects Error: " + error);
      setUserProjects([]);
    }
  }

  // Fetch user data using existing APIs
  const fetchUserData = async (selectedUserId) => {
    try {
      setLoading(true);
      
      // Use existing API to get all users, then filter for the selected one
      const response = await axios.post(`api/getUsers`);
      const userDataArray = response.data;
      
      // Find the clicked user
      const clickedUser = userDataArray.find(user => user.username === selectedUserId);
      
      if (clickedUser) {
        setUserData(clickedUser);
        setDisplayName(clickedUser.displayname || "User");
        setBio(clickedUser.bio || "No bio available");
        // Note: profilePic handling would depend on your existing structure
      } else {
        setError("User not found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-grid-container">
        <div className="loading-message">Loading user profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-grid-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-grid-container">
      <div className="profile-row">
        {/* First column - Profile picture and display name (read-only) */}
        <div className="column-1">
          <div className="picture-container">
            {profilePic ? (
              <img src={profilePic} alt="Profile" />
            ) : (
              <div className="default-avatar">
                <span>No profile picture</span>
              </div>
            )}
          </div>

          {/* Display name container (read-only) */}
          <div className="display-name-container">
            <span className="display-name-readonly">{displayName}</span>
          </div>

          {/* Login prompt for more features */}
          <div className="login-prompt">
            <p>
              <a href="/login">Login</a> to view more features and connect with this user
            </p>
          </div>
        </div>

        {/* Second column - Bio (read-only) */}
        <div className="column-2">
          <div className="bio-container">
            <h2 className="bio-header">About {displayName}</h2>
            <div className="bio-readonly">
              <p>{bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects section (public projects only) */}
      <div className="project-row">
        <div className="project-column">
          <h2>{displayName}'s Public Projects</h2>
          {userProjects.length > 0 ? (
            <div style={{height: "500px", overflow:"scroll"}}>
              <div className='userCardLayout'>
                {userProjects.map(elem => (
                  <ProjCard key={elem.projid} id={elem.projid} info={elem}/>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-projects-message">
              <p>No public projects available</p>
            </div>
          )}
        </div>  
      </div>
    </div>
  );
}