import React, { useEffect, useState } from "react";
import axios from 'axios';

//sending id to backend for cloudinary call 
async function sendImageRequest(id, e) {
    try {
        const response = await axios.post('/api/data', { id: id });
        return response.data;
    } catch (error) {
        console.error('Error submitting user info:', error);
    }
    console.log("Finished accessing information");
}

const UserCard = ({ user }) => {
    const [profilePic, setProfilePic] = useState('');
    const [coverImage, setCoverImg] = useState('');
    const [userLoggedIn, setUserLoggedIn] = useState('false');
    const [guest, setUserName] = useState('');

    //on load, get the user credentials & set default cover image
    useEffect(() => {
        setUserLoggedIn(sessionStorage.getItem('Status'));
        setUserName(sessionStorage.getItem('account'));

        // const fetchData = async () => {
        //     try {
        //         const imageUrl = await sendImageRequest(user.id);
        //         setCoverImg(imageUrl[0]);
        //     } catch (error) {
        //         console.error('Error fetching image URL:', error);
        //     }
        // };
        // fetchData();
    }, []);

    //on load, is user has a specific profile picture then display that image 
    useEffect(() => {
      // Set the profile pic from the user prop
      // Assumes the user object has the 'profilepicurl' property from the database
      if (user.profilepicurl) {
          setProfilePic(user.profilepicurl);
      }
    }, [user.profilepicurl]); // Update when the user prop changes

    //when you click on a userCard take user to userPage
    const handleClick = (event) => {
        console.log("User card clicked. Selected user ID:", user.username);
    
        // Store the selected user's ID in session storage
        sessionStorage.setItem('selectedUserId', user.username);
        // Redirect to the user page
        if (userLoggedIn === 'true') {
            window.location.href = "/userPage";
        } else {
            window.location.href = "/visitorUserPage";
        }
    };

    //when user logs out, clean up the sessionStorage 
    function handleLogOut() {
        sessionStorage.clear();
        window.location.href = "/";
    }

    return (
        // display the associated user image, Display name & their bio
        <div className="userCard" onClick={handleClick}>
            <div className="innerBox">
                <div>
                    {/* Conditionally render the image.
                      If profilePic has a value, use it.
                      Otherwise, default to "images/robot_new.jpg".
                    */}
                    <img 
                      src={profilePic ? profilePic : "images/robot_new.jpg"} 
                      className="thumbnail" 
                      alt={profilePic ? `${user.displayname}'s profile picture` : "A Soyer Robot"}
                    />
                </div>
                <div style={{ textAlign: "center", overflowWrap: "normal" }}>
                    <h2>{user.displayname}</h2>
                    <div className="bioContainer">
                        <p className="bio">Bio: {user.bio}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCard;
