import React, { useState, useEffect } from "react";
import ProjCard from "../Components/projCard";
import axios from 'axios';

export default function VisitorUserPage() {
  const [profilePic, setProfilePic] = useState(null); 
  const [displayName, setDisplayName] = useState("");  
  const [bio, setBio] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userData, setUserData] = useState(null);
  const [userProjects, setUserProjects] = useState([]);


  useEffect(() => {
    const userId = sessionStorage.getItem("selectedUserId");
    if (userId) {
      setSelectedUserId(userId);
    }
  }, []);


  useEffect(() => {
    if (selectedUserId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.post(`api/getUserByName`, { userName: selectedUserId });
          const userData = response.data;
          setUserData(userData);
          
          setDisplayName(userData.displayname || "No display name");
          setBio(userData.bio || "No bio provided");
          
          if (userData.profilepicurl) {
            setProfilePic(userData.profilepicurl);
          }

          getSpecificProjects(userData.username);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [selectedUserId]);


  async function getSpecificProjects(username) {
    try {
      const response = await axios.post(`api/getUserProjects`, { username: username });
      setUserProjects(response.data);
    } catch (error) {
      console.log("Getting User Projects Error: " + error);
    }
  }

  return (
    <div className="profile-grid-container">
      <div class="profile-row">
        <div className="column-1">
          <div className="picture-container">
            <img 
              src={profilePic ? profilePic : "images/robot_new.jpg"} 
              alt={profilePic ? `${displayName}'s profile picture` : "Default profile picture"} 
            />
          </div>

          <div className="display-name-container">
            <span>{displayName}</span>
          </div>

        </div>

        <div className="column-2">
          <div className="bio-container">
            <h2 className="bio-header">User Bio</h2>
            <div>
              <p>{bio}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="project-row">
        <div className="project-column">
          <h2>User Projects</h2>
          <div style={{ height: "500px", overflow: "scroll" }}>
            <div className='userCardLayout'>
              {userProjects.length > 0 ? (
                userProjects.map(elem => (
                  <ProjCard key={elem.projid} id={elem.projid} info={elem} />
                ))
              ) : (
                <p>No projects found</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}