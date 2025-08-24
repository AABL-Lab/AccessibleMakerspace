import React, { useState, useEffect, useRef } from "react";
import ProjCard from "../Components/projCard";
import axios from 'axios';
import { decryptData } from "../Components/adminEncrypt";

//Todo: restrict front end access to edit acces on userPage. user's shouldnt see the edit buttons or 
// delete button unless it is their page. The server verifies the user before nay changes are made but 
// theirs no feedback to frontend wheter change was successful. 
export default function UserPage() {
  const [profilePic, setProfilePic] = useState(null); 
  const [displayName, setDisplayName] = useState("Edit Display Name");  
  const [editMode, setEditMode] = useState(false); 
  const [savedClass, setSavedClass] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false); 
  const [oldPassword, setOldPassword] = useState(""); 
  const [newPassword, setNewPassword] = useState(""); 
  const [passwordError, setPasswordError] = useState(""); 
  const [showPopup, setShowPopup] = useState(false); 
  const [confirmDelete, setConfirmDelete] = useState(false); 
  const [bio, setBio] = useState("Enter your bio here");
  const [newBio, setNewBio] = useState("");
  const [editBioMode, setBioEditMode] = useState(false);
  const [userId, setSelectedUserId] = useState("");
  const [userData, setUserData] = useState("");
  const [account, setAccount] = useState("");
  const [userProjects, setUserProjects] = useState([]);
  const [adminUser, setAdminUser] = useState(false);

  // Retrieve the selected user's ID from sessionStorage
    

    // (async () => {
    //   try {
    //     const result = await verifyAdminStatus(storedAccount, storedKey);
    //     setAdminUser(result);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // })();

    //TODO still session, but encrypted, and verify admin everytime doing changes
    useEffect(() => {
    const storedUserId = sessionStorage.getItem("selectedUserId");
    const storedAccount = sessionStorage.getItem("account");
    const adminEncrypt = sessionStorage.getItem('admin');
    if (adminEncrypt) {
      const adminStatus = decryptData(adminEncrypt);
      setAdminUser(adminStatus === 'true');
    }

    getSpecificProjects(storedAccount);
  

    setSelectedUserId(storedUserId);
    setAccount(storedAccount);

  }, []);

  // function that gets the user's projects 
  // TODO: Need to change the logic to be the selected user
  async function getSpecificProjects(user){
    try {
      const response = await axios.post(`api/getUserProjects`, { username: user });
      setUserProjects(response.data);
    }
    catch (error){
      console.log("Getting User Projects Error: " + error);
    }
  }

  // get the user's id based on their account name 
  useEffect(() => {
    if (account != null) {
      if (!adminUser && userId !== account) {
        window.location.href = "/visitorUserPage";
      }
      const fetchUser = async () => {
        try {
          const response = await axios.post(`api/getUserByName`, { userName: account });
          const userData = response.data;
          // Update state with the fetched user data
          setUserData(userData);
          // You can set other state variables here if needed
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUser();
    } else {
      console.error("No account found in session storage");
    }
  }, [account]); //use affect depend on account variable not being null

  //Populate information on userPage based on clicked userCard
  useEffect(() => {
    // const selectedUserId = sessionStorage.getItem("selectedUserId");
    if (userData != null) {
      // Make a request to fetch the user's account information based on the ID
      const fetchUser = async () => {
        try {
          const response = await axios.post(`api/getUsers`);
          const userDataArray = response.data; // Assuming response.data is an array of user objects

          // Retrieve the clicked user's ID from sessionStorage
          const selectedUserId = sessionStorage.getItem("selectedUserId");

          // Filter the userDataArray to find the clicked user
          const clickedUser = userDataArray.find(user => user.username === selectedUserId);

          // Update state or perform other operations with the clicked user data
          if (clickedUser) {
            setDisplayName(clickedUser.displayname);
            setBio(clickedUser.bio);
            // Update other state variables as needed
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUser();
    } else {
      console.error("No selected user ID found in sessionStorage");
    }
  }, [userData])

  //allows user to change their account's profile photo 
  //todo: connect to backend functionality 
  const handlePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  //change User's display name 
  //todo: connect to backend functionality 
  const handleDisplayNameChange = (event) => {
    setDisplayName(event.target.value);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setSavedClass("");
  };

  const handleSaveDisplayName = () => {
    setEditMode(false);
    setSavedClass("saved");
  };

  const handleShowChangePassword = () => {
    setShowChangePassword(true);
  };
  
  //password verification 
  const handleChangePassword = () => {
    const capitalLetterRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;

    if (oldPassword && newPassword) {
      if (!capitalLetterRegex.test(newPassword)) {
        setPasswordError("Password must contain at least one capital letter.");
      } else if (!numberRegex.test(newPassword)) {
        setPasswordError("Password must contain at least one number");
      } else {
        // localStorage.setItem('userPassword', newPassword);
        alert("Password changed successfully");
        setOldPassword("");
        setNewPassword("");
        setShowChangePassword(false);
        setPasswordError(""); // Reset error on success
      }
    } else {
      alert("Please enter both old and new passwords.");
    }
  };

  const handleEditBio = () => {
    setNewBio(bio);
    setBioEditMode(true);
  };

  const handleSaveBio = () => {
    setBio(newBio);
    setBioEditMode(false);
    alert("Bio saved successfully");
  };

  const handleDeleteConfirmation = () => {
    setConfirmDelete(true);
  };

  useEffect(() => {
    if (confirmDelete) {
      console.log("confirmed deletion");
      deleteUser();
    }
  }, [confirmDelete]);

  // users can delete their accounts from server
  // bug: any user can see other user's delete button but server wont allow them to complete the deletion
  async function deleteUser() {
    const account = sessionStorage.getItem('account');
    const key = sessionStorage.getItem('key');

    try {
      const response = await axios.post('/api/deleteUser', { username: account, password: key });
      console.log("delete status: ", response.data);
      //log user out by clearing all the storage information
      sessionStorage.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="profile-grid-container">
      <div class="profile-row">
        {/* First column */}
        <div className="column-1">
          <div className="picture-container">
            {profilePic ? (
              <>
                <img src={profilePic} alt="Profile Preview" />
              </>
            ) : (
                <span>Click to upload profile picture </span> 
              )}

            {/* Input for selecting an image file */}
            <input
              type="file"
              id="profilePicInput"
              accept="image/*"
              onChange={handlePictureChange}
            />
          </div>

          {/* Display name container */}
          <div className="display-name-container">
            {editMode ? (
              <>
                <input
                  type="text"
                  placeholder="Enter Display Name"
                  value={displayName}
                  onChange={handleDisplayNameChange}
                />
                <button className="save-button" onClick={handleSaveDisplayName}>
                  <span role="img" aria-label="Save">
                  </span>{" "}
                  Save
                </button>
              </>
            ) : (
                <>
                  <span>{displayName}</span>
                  <button className="edit-button" onClick={handleEditToggle}>
                    <span role="img" aria-label="Edit">
                    </span>{" "}
                    Edit
                  </button>
                </>
              )}
          </div>

          {/* Change password */}
          <div className="change-password">
            {showChangePassword ? (
              <>
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="change-password-input"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="change-password-input"
                />

                {passwordError && <div className="password-error">{passwordError}</div>}
                <button className="change-password-button" onClick={handleChangePassword}>
                  Change Password
                </button>
              </>
            ) : (
                <div className="change-password-link" onClick={handleShowChangePassword}>
                  Change Password
                </div>
              )}
          </div>
        </div>


        {/* Second column */}
        <div className="column-2">
          <div className="bio-container">
            <h2 className="bio-header">User Bio</h2>
            {!editBioMode ? (
              <div>
                <p>{bio}</p>
                <button className="edit-button" onClick={handleEditBio}>
                  Edit Bio
                </button>
              </div>
            ) : (
                <div>
                  <textarea
                    placeholder="Enter your bio"
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    className="bio-textarea"
                    rows="5"
                    cols="50"
                  />
                  <button className="save-button" onClick={handleSaveBio}>
                    Save Bio
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>

      <div class="project-row">
        <div className="project-column">
          <h2>Your Projects</h2>
          <div style={{height: "500px", overflow:"scroll"}}>
            <div className='userCardLayout'>
              {userProjects.map(elem => (
                <ProjCard key={elem.projid} id={elem.projid} info={elem}/>
              ))}
            </div>
          </div>
        </div>  
      </div>
    
      <div class="delete-row">
        <div className="delete-column">
          <div className="delete_button_container">
            <button className="delete_button" onClick={() => setShowPopup(true)}> Delete Account </button>
          </div>
          {showPopup && (
            <div className="modal-overlay">
              <div className="popup">
                <p> Are you sure you want to delete your account?</p>
                <button onClick={() => setShowPopup(false)}> No </button>
                <button onClick={handleDeleteConfirmation}>Yes</button>
              </div>
            </div>
          )}
        </div>  
      </div>
    </div>
  );
}