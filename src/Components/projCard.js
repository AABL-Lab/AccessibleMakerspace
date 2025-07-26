import React, {useEffect, useState} from "react";
import axios from 'axios';
import { decryptData } from "./adminEncrypt";

// Send the requested project's id to cloudinary to get cover photo 
async function sendImageRequest (id, e) {
  try { //Handle Success
    const response = await axios.post('/api/data',{id: id});
    return response.data;
  } catch (error) { // Handle error
    console.error('Error submitting user info:', error);
  }
  console.log("Finished accessing information");
};
export { sendImageRequest };

const ProjCard = ({ id , info }) => {
  const [coverImage, setCoverImg] = useState('');
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [guest, setUserName] = useState(''); 
  const [key, setKey] = useState(''); 
  const [selectedUserId, setSelectedUserId] = useState('');
  const [adminUser, setAdminUser] = useState(false);

  // TODO: toggle edit & delete buttons based on the logged in user 
  // async function checkUserID (guest) {
  //   console.log(guest);
  //   console.log("about to send server request: ", guest);
  // //   const response = await axios.post('/api/getUserByName',{userName: guest}); //TODO: doesnt return the userID
  // //   console.log("id returned: ", response.data);
  // }
  
  //on load, get user credentials & make image request
  useEffect(() => { 
    setUserLoggedIn(sessionStorage.getItem('Status') === 'true');
    setKey(sessionStorage.getItem('key'));
    setUserName(sessionStorage.getItem('account'));
    setSelectedUserId(sessionStorage.getItem('selectedUserId'));
    const adminEncrypt = sessionStorage.getItem('admin');
    if (adminEncrypt) {
      const adminStatus = decryptData(sessionStorage.getItem('admin'));
      setAdminUser(adminStatus === 'true');
    }

    // checkUserID(guest);

    //function that calls request for project images
    const fetchData = async () => {
      try {
        console.log(`id:${id}`);
        const imageUrl = await sendImageRequest(`id${id}`);
        setCoverImg(imageUrl[0]);
      } catch (error) {
        console.error('Error fetching image URL:', error);
      }
    };
    fetchData();
  },[]);

  //user deleting a project using the Delete button 
  async function handleDelete(e){
    e.stopPropagation(); // Stops the loading of the project specific page 
    const idNumber = parseInt(id.replace("id", ""));
    try{
      const response = await axios.post('/api/deleteProject', {username: guest, password: key, projid: idNumber});
      if(response.data == false){
        alert("You cannot delete this project because you are not the creator.");
      }
    }catch (error) {
      console.error("Error deleting project:", error);
    }
  }
  //function that opens the singleProj page when a projectCard is clicked & store the proj ID
  const handleClick = (event) => {
    const selectedProj = event.currentTarget.id;
    console.log("Project Card Being called: ",event.currentTarget.id);
    const projID = `id${selectedProj}`;
    sendImageRequest(projID);
    //store the project id while they are on this website 
    sessionStorage.setItem('projectId', projID); 
    window.location.href = "/project";
  };

  // user editing a project using the Edit button - opens the prefilled form 
  async function handleEdit(e){
    e.stopPropagation();
    sessionStorage.setItem('Editing', true); 
    sessionStorage.setItem('EditingID', id);
    setTimeout(() => {
      window.location.href = "/projectUpload";
    }, 0);
  }

  // on log out, cleans the sessionStorage 
  function handleLogOut(){
    sessionStorage.clear();
    window.location.href = "/";
  }

  return(
    // displays each card with the proper format 
    <div className="projCard" id={id} onClick={handleClick}> 
      <div className="innerBox">
        {userLoggedIn && (adminUser || selectedUserId === guest) ? (
          <div className="controls"> 
            <button className="deleteLink" onClick={handleDelete} > Delete </button>
            <button className="editLink" id={id} onClick={handleEdit}> Edit </button>
          </div>
        ) : null}

        <div>
          {coverImage && <img className="thumbnail" src={coverImage} alt="Project Thumbnail" />}
        </div>
       
        <div style={{textAlign:"center", overflowWrap:"normal"}}> 
          <h2> {info.title} </h2> 
        </div>

        <div className="tags"> {info.tags} </div>
      </div>
    </div>
  );
};

export default ProjCard;