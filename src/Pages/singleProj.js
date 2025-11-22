import React, { useState, useEffect } from "react";
import YouTube, {YoutubeProps} from "react-youtube"; 
import CommentSection from "../Components/commentSectionTwo"; 
import PhotoSlider from "../Components/photoslider";
import axios from "axios";
import { decryptData } from "../Components/adminEncrypt";
const {sendImageRequest} = require('../Components/projCard');

//grab image request information from click on projects page
async function processImages(projID) {
  try {
    const dataArray = await sendImageRequest(projID);
    return dataArray;
  } catch (error) {
    console.error('Error:', error);
  }
}

//sever call to get the requested project
async function getProject(projid){
  console.log("Getting a project");
  try{
    const response = await axios.post('/api/project', {id: projid});
    console.log("Project Aquired");
    return response.data;
  }
  catch (err){
    console.log("getProject ERROR: " + err);
  }
}

//Display all the information about the project
export default function SingleProj(props){
  const [imageUrls, setImageUrls] = useState([]);
  const [projectInfo, setProjectData] = useState([]);
  const [items, setItems] = useState([]);
  const [aslExists, setASLstatus]= useState(false);
  const [videoExists, setVideoExists]= useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const [id, SetID] = useState('');
  const [key, setKey] = useState(''); 
  const [username, setUserName] = useState('');
  const [adminUser, setAdminUser] = useState(false);

  console.log("I am in Single project function");
  
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.35,  // 35% of window width
    height: (window.innerWidth * 0.35) / 1.77,  // Maintain 16:9 aspect ratio
  });
  
  // on page load: grab the project id from the clicked card's storage value 
  // and call the function for the project's data
  useEffect(() => {
    const projID = sessionStorage.getItem('projectId');
    setUserName(sessionStorage.getItem('account'));
    SetID(sessionStorage.getItem('projectId'));
    processImages(projID).then(data => {
        setImageUrls(data);
    });
    getProject(projID).then(project => {
      setProjectData(project);
      console.log(project.supplies);
      //TODO - RESOLVE UNDEFINED SUPPLIES ON EDIT MODE 
      const cleanElements = project.supplies
        .filter(element => element !== undefined); // Filtering out undefined values
        
      setItems(cleanElements);
      //when the project info is recieved from the server, check for videos
      checkVideos(project.aslurl,project.videourl);
    });
    setUserLoggedIn(sessionStorage.getItem('Status') === 'true');
    setEditingMode(sessionStorage.getItem('Editing'));
    setKey(sessionStorage.getItem('key'));
    const adminEncrypt = sessionStorage.getItem('admin');
    if (adminEncrypt) {
      const adminStatus = decryptData(sessionStorage.getItem('admin'));
      setAdminUser(adminStatus === 'true');
    }

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth * 0.35,
        height: (window.innerWidth * 0.35)  / 1.77,
      });
    };

    // Listen for window resize events
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  //Youtube API
  const [player, setPlayer] = useState(null);
  const [youtubeID, setYoutubeID] = useState("");
  const [aslID, setAslID] = useState("");
  const onReady = (e) => {
    setPlayer(e.target);
  };
  const opts = {
    height: `${dimensions.height}`,
    width: `${dimensions.width}`,
    // playerVars: { //TODO: Captions and transcript not working
    //   // Enable captions and specify language
    //   cc_lang_pref: 'en',  // Language preference
    //   cc_load_policy: 1,   // Enable captions by default
    // },
  };

  //if there is a string in youtube variable in server than parse URL to get the video ID
  function checkVideos(aslVideo, youtubeVideo){
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    if(youtubeVideo != null){
      const match = youtubeVideo.match(regex);
      // If a match is found, return the video ID 
      if (match && match[1]) {
        setYoutubeID(match[1]);
        setVideoExists(true);
      }
    }
    if(aslVideo != null){
      const match = aslVideo.match(regex);
      if (match && match[1]) {
        setAslID(match[1]);
        setASLstatus(true);
      }
    }
  }

  //Log user out on click 
  function handleLogOut(){
    sessionStorage.clear();
    window.location.href = "/";
  }
  
  //sets edit mode & opens th form page i.e projectUpload
  async function handleEdit(e){
    e.stopPropagation();
    sessionStorage.setItem('Editing', true); 
    sessionStorage.setItem('EditingID', id);
    setTimeout(() => {
      window.location.href = "/projectUpload";
    }, 0);
  }

  //user deleting a project using the Delete button 
  async function handleDelete(e){
    e.stopPropagation(); // Stops the loading of the project specific page 
    console.log("deleting a project");
    console.log('key: ',key);
    const idNumber = parseInt(id.replace("id", ""));
    try{
      const response = await axios.post('/api/deleteProject', {username: username, password: key, projid: idNumber});
      console.log("delete status: ", response.data);
      if(response.data == false){
        alert("You cannot delete this project because you are not the creator.");
      } else {
        alert("Project deleted!");
        window.location.href = "/projects";
      }
    }catch (error) {
      console.error("Error deleting project:", error);
    }
  }

  return(
    <div>
      <h1 style={{textAlign:"center",marginTop:"40px",marginBottom:"10px"}}> {projectInfo.title} </h1>
      {userLoggedIn && adminUser ? (
        <div className="twoColRowButtons"> 
          <button className="deleteNewButton" onClick={handleDelete} > Delete </button>
          <button className="editNewButton" id={id} onClick={handleEdit}> Edit </button>
        </div>
      ) : null}
      <div className="twoColRow" style={{gridGap: "0px"}}>
        <PhotoSlider images={imageUrls}/>
        <div> {/* Needed to hold Description & Supplies structure together */}
          <div className="descBlock" style={{paddingTop:"0px"}}>
            <h2> Desciption</h2>
            <p style={{paddingRight:"30px"}}>{projectInfo.description}</p>
          </div>
          <div className="supplies">
            <div className="supplyBlock">
              <h2> Supplies</h2> 
              <ul> 
                {/* Map over each item in the items array and create a list item for each */}
                {items.map((item, index) => (
                  <li key={index}>
                    {item[0]}  {item[1]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="oneColRow">
        {/* boolean stating if video links in the server & based on that, video format changes */}
        {videoExists ? (
          <div>
            <h2 style={{ textAlign: "center" }}>Project Video!</h2>
            <div className="videoContainer">
              <div className="videoBlock">
                <YouTube videoId={youtubeID} opts={opts} onReady={onReady} />
              </div>
            </div>
            {aslExists ? (
              <div className="videoContainer">
                <h2 style={{ textAlign: "center" }}>ASL Video!</h2>
                <div className="videoBlock">
                  <YouTube videoId={aslID} opts={opts} onReady={onReady} />
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <h1> ASL video currently unavailable. </h1>
              </div>
            )}
          </div>
        ):(
          <div> <h2> No videos currently exist for this project. </h2> </div>
        )}
      </div>
      
      {/* project comment section */}
      <div className="oneColRow">
        <div> <CommentSection projID={id}/> </div>
      </div>
    </div>
  );
}