import React, { useState, useEffect, useRef } from "react";
import FilterableDropdown from "../Components/FilterableDropdown";
import axios from "axios";
import fetch from "node-fetch"

// Server call to get the general list for Tags & Skills
async function getTagSkills(){
  try{
    const response = await axios.post('/api/getTags');
    return response.data;
  }
  catch (err){
    console.log("getTagSkills ERROR: " + err);
  }
};

// SuppliesContent is a component (with its own return) that store the added supplies and creates the table
const SuppliesContent = ({quantity, setQuantity, itemName, setItemName, items, setItems }) => {
  const handleAddButtonClick = (event) => { 
    if (quantity > 0 && itemName.trim() !== '') {
      // Create a new item object
      const newItem = {
        quantity: quantity,
        itemName: itemName
      };
  
      // Update the items state with the new item
      setItems(prevItems => [...prevItems, newItem]);
  
      // Clear input fields after adding
      setQuantity(0);
      setItemName('');
    }
  }; 

  return (
    <>
    {/* TODO: ask Manpreet ot add back increment */}
    {/*This is the entire design for the div box and supplies.*/}
    <div class="center-headings">
      <h2>Supplies:</h2>
      <h5> Please enter each item as a separate entry. </h5>
    </div>
    <div class="supplies-container">
      <div class="input-container">
        <input
          type="number"
          min="0"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
         {/*Input box and button functiionality*/}
        <textarea
          id="input"
          name="input"
          rows="1"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <button class="add-button" onClick={handleAddButtonClick}>Add</button>
      </div>
    </div>
        
    {/* Display the items in a table */}
    {items.length > 0 && (
    <div class="table-style">
      <table>
        <thead>
          <tr>
            <th>Quantity</th>
            <th>Item Name</th>
          </tr>
        </thead>
        <tbody>
          {/* limits items to five rows item.map*/}
          {items.slice(0, 5).map((item, index) => (
            <tr key={index}>
              <td>{item.quantity}</td>
              <td>{item.itemName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )}
    </>
  );
}; 

// SkillsContent is a function that calls the FilterableDropdown component
// allowing the users to select from a premade list of skills/tags and/or add their own
function SkillsContent({list, skills, setSkills}) {
  return (
    <>
      <div class = "center-headings">
        <h2>Skills:</h2>
        <h5> Please limit to 5 skills. </h5>
      </div>
      <div>
        <FilterableDropdown options={list} skills={skills} setSkills={setSkills} id="skills"/>
      </div>
    </>
  );
};

// RelevantTagsContent is a function that calls the FilterableDropdown component
//  allowing the users to select from a premade list of skills/tags and/or add their own
function RelevantTagsContent({list, typedTag, setTypedTag}){
  return (
    <>
      <div class = "center-headings">
        <h2>Select Relevant Tags:</h2>
        <h5> Please limit to 5 tags. </h5>
      </div>
      <FilterableDropdown options={list} typedTag={typedTag} setTypedTag={setTypedTag} hideLevel={true} id="tags"/>
    </>
  );
};


//Main Function that displays all components of the Upload project form 
export default function Home(){ 
  const [generalList, setGeneralList] = useState([]);
  const [numImages, setNumImages] = useState(0);
  const [projImages, setProjImages] = useState([]);
  const [title, setTitle] = useState("");
  const [id, setProjID] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [skills, setSkills] = useState([]); 
  const [typedTag, setTypedTag] = useState([]);
  const [quantity, setQuantity] = useState(0);   
  const [itemName, setItemName] = useState("");
  const [projVideo, setProjVideo] = useState("");
  const [items, setItems] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [possibleErrors, setPossibleErrors] = useState({
    incompleteForm: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    projid: '', 
    videourl: '', 
    aslurl: '', //add that edit feature only for admins!
    title: '',
    description: '',
    skills: [],
    supplies: [],
    tags: [],
  });

  //on page load, get the skills/tags list, check if in editing mode, 
  useEffect(() => {
    getTagSkills()
      .then(data => {
        setGeneralList(data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
    const editing = sessionStorage.getItem('Editing') === 'true';
    //if in editing mpde the fill the form with the clicked project's stored information
    if(editing){ 
      setEditMode(editing);
      preFillForm();
    }
    //clear values if user leaves page
    return () => {
      clearValues();
    }
  }, []);

  //get the project's data from the server to prefill form in editing mode
  const preFillForm = async () => {
    const projid = sessionStorage.getItem('EditingID');
    setProjID(sessionStorage.getItem('EditingID'));
    try {
      const response = await axios.post('/api/project', {id: projid});
      setFormData(response.data);
    } catch (err) {
      console.log("Error editing project: " + err);
    } 
  }
  
  //store the user credentials in order to later verify editing capabilities
  useEffect(() => { 
    setUsername(sessionStorage.getItem('account'));
    setPassword(sessionStorage.getItem('key'));
  },[username,password]);


  //once the project's data is recieved from server, fill in the appropriate variables 
  useEffect(() => {
    setTitle(formData.title || "");
    setProjVideo(formData.videourl || null);
    setProjDesc(formData.description || "");
    setSkills(formData.skills || []);
    console.log("skills projectUpload");
    console.log("formData.skills", formData.skills);
    setItems(formData.supplies || []);
    setTypedTag(formData.tags || []);
  },[formData]);
  
  //function processes the uploaded images, and properly formats them for sending
  const handleFileUpload = (event) => {
    const files = event.target.files; // Get the selected files
    const fileList = Array.from(files); // Converting files to an array

    for (let i = 0; i < fileList.length; i++){
      console.log("Type of File: " + typeof fileList[i])
      console.log(fileList[i] instanceof Blob)
      console.log(fileList[i] instanceof ArrayBuffer)
    }

    const readFileAsBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result)
        }
        reader.onerror = reject;
        console.log("File Type: " + typeof file)
        reader.readAsDataURL(file)
        // return reader.result;
      })
    }
    
    Promise.all(fileList.map(image => readFileAsBase64(image))).then(base64Strings => {
      const updatedImages = fileList.map((file, index) => ({
        file: file,
        description: '', // Initialize description to empty string
        previewUrl: URL.createObjectURL(file), // Create a preview URL for each image
        base64: base64Strings[index] // Assign the corresponding Base64 string
      }));
      const formData = new FormData();
      updatedImages.forEach((image, index) => {
          formData.append(`file${index}`, image.base64); // Append each file to FormData
      });
  
      // console.log("Form Data: ", formData)
      console.log("formData: ")
      for (let pair of formData.entries()){
        console.log(pair[0],pair[1])
      }
      setProjImages(prevImages => [...prevImages, ...formData]);

    }).catch(error => {
      console.log("Error with getting Images: " + error)
    })
    
    // file: image,
    // description: '', // Initialize description to empty string
    // previewUrl: URL.createObjectURL(image), // Create a preview URL for each image
    // base64: readFileAsBase64(image)
    
    
    // Adding the new files to the existing projImages array
    // setProjImages(prevImages => [...prevImages, ...updatedImages]);

  };

  //on submit, uploaded images to the backend & send the user's project data to the backend
  const handleSubmit = async () => {
    checkCompleteness();
    
    console.log("incompleteForm: ", possibleErrors.incompleteForm);

    try{
      console.log("Project Images")
      console.log(projImages)
      if (Array.isArray(projImages)){
        console.log("We are of type array")
      }
      else {
        console.log("We are not of type array")
      }

      let Images = new FormData();
      for (let i = 0; i < projImages.length; i++){
        console.log(projImages[i][0], projImages[i][1])
        Images.append('images', projImages[i][1])
      }

      if (Images instanceof FormData){
        console.log("We are of type form data")
      }
      else {
        console.log("We are not of type form data")
      }

      console.log("Images: ")
      for (let pair of Images.entries()){
        console.log(pair[0], pair[1])
      }
  
      const response = await axios.post('/api/createProject', {
        userName: username, 
        password: password, title:title, description:projDesc, 
        videoURL:projVideo, projImages:[],
        supplies:items, skill:skills, tags:typedTag 
      });

      console.log("Responce Data: " + response.data);
      let project = response.data;
      console.log(parseInt(project));

      Images.append('username', username)
      Images.append('password', password)
      Images.append('projid', project)
      
      const config = {headers: {'Content-Type': 'multipart/form-data'}}
      const fetchResponce = await axios.post( '/api/uploadImage', Images, config)
      console.log("Fetch responce: " + fetchResponce.data)
      console.log("Project Sent");

      // console.log("Fetch Responce" + response.data)
      
      setTimeout(function() {
        window.location.href = "/projects";
      }, 500);
      // return response.data;
    }
    catch (err){
      console.log("Error submitting project: " + err);
    }
  };

  //error checking function that ensure all required parts of the form is there
  function checkCompleteness(){
    console.log("submiting form");
    console.log("title: ", title);
    console.log("projDesc: ", projDesc);
    console.log("numImages: ", numImages);
    console.log("skills: ", skills);
    console.log("typedTag: ", typedTag);
    console.log("supplies: ", items);
    console.log("images: ", projImages);
    console.log(username, password); 
    console.log("done");

    // Error handling for incomplete form submittions 
    if( title === '' || projDesc === '' || projImages.length === 0 || 
      skills.length === 0 || typedTag.length === 0 || items.length === 0){
        setPossibleErrors(prevState => ({
          ...prevState,
          incompleteForm: true
        }));
      return;
    }
  };

  //when an error occures, if user is changing the value to resolve issue then error message hides
  const handleChange = (event) => {
    event.preventDefault();
    if(possibleErrors.incompleteForm){
      setPossibleErrors(prevState => ({
        ...prevState,
        incompleteForm: false
      }));
      console.log("incompleteForm: ", possibleErrors.incompleteForm);
    }
  };

  //Function that updates the projects' information in editing mode
  async function handleUpdate(){
    console.log("updating");
    checkCompleteness();
    try{
      console.log("about to call server");
      let response = await axios.post("/api/editProject", {
        username: username, password: password, projid:Number(id), 
        title:title, description:projDesc, 
        videoURL:projVideo, projImages:projImages,
        supplies:items, skill:skills, tags:typedTag 
      });
      console.log(response.data);
      if(response.data){
        window.location.href = "/project";
      }else{
        alert("could not edit project");
      }
    }catch (err){
      console.log("Error updating project: " + err);
    }
  }

  //call on page leave or update submission to clean up prefill values 
  function clearValues(){
    sessionStorage.removeItem('Editing');
    sessionStorage.removeItem('EditingID');
    setFormData({
      projid: '',
      videourl: '',
      aslurl: '',
      title: '',
      description: '',
      skills: [],
      supplies: [],
      tags: []
    });
  }

  return( 
    <>  
      {/*  error code messaging */}
      {possibleErrors.incompleteForm ? (
        <div class="incompleteForm"> 
          <h2> Please make sure you fill out all the fields in the form before 
          uploading your project. Adding a video is optional. </h2>
        </div>):(
      <div></div>)}
      {/* Container for the main grid */}
      <div class="grid-container">
        {/* Container for the project title */}
        <div class="grid-project-title-container">
          <div class ="project-title">
            <h2>Project Title: </h2>
            {/* Textarea for the user to enter the project title */}
            <input id="project-title-input" value={title} onChange={(e) => setTitle(e.target.value)}  />
          </div>
        </div>

        {/* Container for the project description - TODO: add to server for storage */}
        <div class="grid-item description-container">
          <div class ="description">
            <h2>Description: </h2>
            <textarea id="description" value={projDesc} onChange={(e) => setProjDesc(e.target.value)} ></textarea>
          </div>
        </div>  
        {/* Container for aligning the image and video upload sections */}
        <div class="alignment">
          {/* Container for the image upload */}
          <div class="grid-item image-container">
            <div class="image-upload">
            {/* Heading for uploading image*/}
              <h2>Upload Image:</h2>

              {/* Input for selecting multiple image files */}
              <input type="file" id="image" className="uploadImage" accept=".jpg, .png, .jpeg" multiple required onChange={handleFileUpload}></input>
              
              {/* <h2>Image Description:</h2> */}
              {/* Display div and input for each image */}
              {projImages.map((image, index) => (
                <div key={index}>
                  {/* Image preview if needed */}
                  {/* <img style={{width:"80px", paddingRight:"5px", paddingBottom:"8px"}} src={URL.createObjectURL(image.file)} alt={`Image ${index}`} /> */}
                  {projImages.map((image, index) => (
                      <img key={index} style={{width:"80px", paddingRight:"5px", paddingBottom:"8px"}} src={image.previewUrl} alt={`Image ${index}`} />
                  ))}

                  {/* Optional TODO: can implement image describtions to be used for alt text if images dont show.
                  However, server does not currently have a column to store this so that will need to be changed first.*/}
                  {/* Input for image description */} 
                  {/* <div className="imageTextDiv">
                    <textarea
                      type="text"
                      value={image.description}
                      onChange={(e) => {
                        const updatedImages = [...projImages];
                        updatedImages[index].description = e.target.value;
                        setProjImages(updatedImages);
                      }}
                      className="textarea-design"
                      placeholder="Enter description"
                    >
                    </textarea>
                  </div> */}
                </div>
              ))}
            </div>
          </div>

          {/* Container for the video upload section*/}
          <div class="grid-item video-container">
            <div class="video-upload"> 
              <h2>Upload Video:</h2>
              {/* Input for entering video URLs, mainly from YouTube */}
              <input type="url" id ="url" name="url" value={projVideo} onChange={(e) => setProjVideo(e.target.value)}></input>
              <h2>Video Description:</h2>
              {/* Textarea for entering video descriptions */}
              <textarea id="video-description" name="video-description" rows="3" placeholder="Enter video description"></textarea>
            </div>
          </div>
        </div>

        {/* Refers to the above components. */}
        <SuppliesContent quantity={quantity} setQuantity={setQuantity} 
          itemName={itemName} setItemName={setItemName} items={items}
          setItems={setItems}
        />
        <SkillsContent list={generalList} skills={skills} setSkills={setSkills}/>
        <RelevantTagsContent list={generalList} typedTag={typedTag} 
          setTypedTag={setTypedTag}
        /> 
      
        {/* Submit button.*/}
        <div class="grid-item submit"> 
          {editMode ? ( 
            <div>
              <button class="submit-button" onClick={handleUpdate}>Update</button>
            </div>
          ):(
            <div>
               <button class="submit-button" onClick={handleSubmit}>Submit</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

