import React, { useState, useEffect } from "react";
import FilterableDropdown from "../Components/FilterableDropdown";
import axios from "axios";
import { decryptData } from "../Components/adminEncrypt";

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

// SuppliesContent Component
const SuppliesContent = ({quantity, setQuantity, itemName, setItemName, items, setItems }) => {
  const handleAddButtonClick = (event) => { 
    if (quantity > 0 && itemName.trim() !== '') {
      const newItem = {
        quantity: quantity,
        itemName: itemName
      };
      setItems(prevItems => [...prevItems, newItem]);
      setQuantity(0);
      setItemName('');
    }
  }; 

  // Function to remove a supply item
const handleDeleteSupply = (indexToRemove) => {
  setItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
};

  return (
    <>
    <div className="center-headings">
      <h2>Supplies:</h2>
      <h5> Please enter each item as a separate entry. </h5>
    </div>
    <div className="supplies-container">
      <div className="input-container">
        <input
          type="number"
          min="0"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <textarea
          id="input"
          name="input"
          rows="1"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <button className="add-button" onClick={handleAddButtonClick}>Add</button>
      </div>
    </div>
        
    {items.length > 0 && (
    <div className="table-style">
      <table>
        <thead>
          <tr>
            <th>Quantity</th>
            <th>Item Name</th>
          </tr>
        </thead>
        <tbody>
          {items.slice(0, 5).map((item, index) => (
            <tr key={index}>
              <td>{item.quantity}</td>
              <td>{item.itemName}</td>
              <td>
                  <button 
                    onClick={() => handleDeleteSupply(index)}
                    style={{color: 'red', cursor: 'pointer', border: 'none', background: 'transparent'}}
                  >
                    X
                  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )}
    </>
  );
}; 

// SkillsContent Component
function SkillsContent({list, skills, setSkills}) {
  return (
    <>
      <div className="center-headings">
        <h2>Skills:</h2>
        <h5> Please limit to 5 skills. </h5>
      </div>
      <div>
        <FilterableDropdown options={list} skills={skills} setSkills={setSkills} id="skills"/>
      </div>
    </>
  );
};

// RelevantTagsContent Component
function RelevantTagsContent({list, typedTag, setTypedTag}){
  return (
    <>
      <div className="center-headings">
        <h2>Select Relevant Tags:</h2>
        <h5> Please limit to 5 tags. </h5>
      </div>
      <FilterableDropdown options={list} typedTag={typedTag} setTypedTag={setTypedTag} hideLevel={true} id="tags"/>
    </>
  );
};


// Main Function
export default function Home(){ 
  const [generalList, setGeneralList] = useState([]);
  const [projImages, setProjImages] = useState([]);
  const [title, setTitle] = useState("");
  const [id, setProjID] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [skills, setSkills] = useState([]); 
  const [typedTag, setTypedTag] = useState([]);
  const [quantity, setQuantity] = useState(0);   
  const [itemName, setItemName] = useState("");
  const [projVideo, setProjVideo] = useState("");
  const [aslVideo, setAslVideo] = useState("");
  const [adminUser, setAdminUser] = useState(false);
  const [items, setItems] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [possibleErrors, setPossibleErrors] = useState({
    incompleteForm: false,
    missingAltText: false
  });
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    projid: '', 
    videourl: '', 
    aslurl: '', 
    title: '',
    description: '',
    skills: [],
    supplies: [],
    tags: [],
  });

  useEffect(() => {
    getTagSkills()
      .then(data => {
        setGeneralList(data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
    const editing = sessionStorage.getItem('Editing') === 'true';
    const adminEncrypt = sessionStorage.getItem('admin');
    if (adminEncrypt) {
      const adminStatus = decryptData(adminEncrypt);
      setAdminUser(adminStatus === 'true');
    }

    if(editing){ 
      setEditMode(editing);
      preFillForm();
    }
    return () => {
      clearValues();
    }
  }, []);

  const urlToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
};

  const preFillForm = async () => {
    const projid = sessionStorage.getItem('EditingID');
    setProjID(sessionStorage.getItem('EditingID'));
    try {
      const response = await axios.post('/api/project', {id: projid});
      setFormData(response.data);

      const imgResponse = await axios.post('/api/data', {id: "id" + projid});
      if (imgResponse.data && Array.isArray(imgResponse.data)) {
          const imagePromises = imgResponse.data.map(async (img) => {
              const base64Data = await urlToBase64(img.url);
              return {
                  file: null,
                  base64: base64Data || img.url,
                  previewUrl: img.url,
                  altText: img.alt || ""
              };
          });

          const loadedImages = await Promise.all(imagePromises);
          setProjImages(loadedImages);
      }
    } catch (err) {
      console.log("Error editing project: " + err);
    } 
  }
  
  useEffect(() => { 
    setUsername(sessionStorage.getItem('account'));
    setPassword(sessionStorage.getItem('key'));
  },[username,password]);


  useEffect(() => {
    setTitle(formData.title || "");
    setProjVideo(formData.videourl || "");
    setAslVideo(formData.aslurl || "");
    setProjDesc(formData.description || "");
    setTypedTag(formData.tags || []);

    if(formData.tags && Array.isArray(formData.tags)){
        const formattedTags = formData.tags.map(t => {
            if(Array.isArray(t)){
                return t[0]; 
            }
            if(typeof t === 'object' && t !== null && t.tagName){
                return t.tagName;
            }
            return t;
        });
        setTypedTag(formattedTags);
    } else {
        setTypedTag([]);
    }

    if(formData.skills && Array.isArray(formData.skills)){
       const formattedSkills = formData.skills.map(s => {
           if(Array.isArray(s)){
               return { skill: s[0], skillLevel: s[1] || "Beginner" };
           }
           return s;
       });
       setSkills(formattedSkills);
    } else {
       setSkills([]);
    }

    if(formData.supplies && Array.isArray(formData.supplies)){
        const formattedSupplies = formData.supplies.map(s => {
            if(Array.isArray(s)){
                return { quantity: s[0], itemName: s[1] };
            }
            return s;
        });
        setItems(formattedSupplies);
    } else {
        setItems([]);
    }

  },[formData]);
  
  const handleFileUpload = (event) => {
    const files = event.target.files; 
    const fileList = Array.from(files); 

    const readFileAsBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result)
        }
        reader.onerror = reject;
        reader.readAsDataURL(file)
      })
    }
    
    Promise.all(fileList.map(image => readFileAsBase64(image))).then(base64Strings => {
      // Store objects with explicit Alt Text fields
      const updatedImages = fileList.map((file, index) => ({
        file: file,
        altText: '', // Initialize empty alt text
        previewUrl: URL.createObjectURL(file), 
        base64: base64Strings[index] 
      }));
      
      setProjImages(prevImages => [...prevImages, ...updatedImages]);

    }).catch(error => {
      console.log("Error with getting Images: " + error)
    })
  };

  const handleRemoveImage = (indexToRemove) => {
    setProjImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleAltTextChange = (index, value) => {
    const updatedImages = [...projImages];
    updatedImages[index].altText = value;
    
    if(possibleErrors.missingAltText){
         setPossibleErrors(prevState => ({
        ...prevState,
        missingAltText: false
      }));
    }
    setProjImages(updatedImages);
  };

  const handleSubmit = async () => {
    
    // Run validation first
    if(checkCompleteness()) {
      return; // Stop if validation fails
    }

    try{
      const response = await axios.post('/api/createProject', {
        userName: username, 
        password: password, title:title, description:projDesc, 
        videoURL:projVideo, aslURL:aslVideo, projImages:[],
        supplies:items, skill:skills, tags:typedTag 
      });

      let project = response.data;
      
      let Images = new FormData();
      for (let i = 0; i < projImages.length; i++){
        Images.append('images', projImages[i].base64);
        Images.append('altTexts', projImages[i].altText);
      }

      Images.append('username', username)
      Images.append('password', password)
      Images.append('projid', project)
      
      const config = {headers: {'Content-Type': 'multipart/form-data'}}
      const fetchResponce = await axios.post( '/api/uploadImage', Images, config)
      console.log("Fetch responce: " + fetchResponce.data)
      
      setTimeout(function() {
        window.location.href = "/projects";
      }, 500);
    }
    catch (err){
      console.log("Error submitting project: " + err);
    }
  };

  
  function checkCompleteness(){
    let hasError = false;
    
    // Check basic fields
    if( title === '' || projDesc === '' || projImages.length === 0 || 
      skills.length === 0 || typedTag.length === 0 || items.length === 0){
        setPossibleErrors(prevState => ({
          ...prevState,
          incompleteForm: true
        }));
        hasError = true;
    }

    // Check for missing Alt Text
    const hasMissingAlt = projImages.some(img => !img.altText || img.altText.trim() === '');
    if (hasMissingAlt) {
      setPossibleErrors(prevState => ({
        ...prevState,
        missingAltText: true
      }));
      hasError = true;
    }

    return hasError;
  };

  const handleChange = (event) => {
    event.preventDefault();
    if(possibleErrors.incompleteForm){
      setPossibleErrors(prevState => ({
        ...prevState,
        incompleteForm: false
      }));
    }
  };


  async function handleUpdate(){
    if(checkCompleteness()) return;
    try{
      let projid = id.replace(/^id/i, '');
      let response = await axios.post("/api/editProject", {
        username: username, password: password, projid: Number(projid), 
        title:title, description:projDesc, 
        videoURL:projVideo, aslURL:aslVideo, supplies:items, skill:skills, tags:typedTag 
      });

      if(response.data){
        let Images = new FormData();
        for (let i = 0; i < projImages.length; i++){
          Images.append('images', projImages[i].base64);
          Images.append('altTexts', projImages[i].altText);
        }

        // Add auth and ID to FormData
        Images.append('username', username);
        Images.append('password', password);
        Images.append('projid', Number(projid));

        const config = {headers: {'Content-Type': 'multipart/form-data'}};
        await axios.post('/api/replaceImages', Images, config);

        // Redirect after success
        window.location.href = "/projects";
      }else{
        alert("could not edit project");
      }
    }catch (err){
      console.log("Error updating project: " + err);
    }
  }

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
      {possibleErrors.missingAltText && (
        <div className="incompleteForm" style={{
            backgroundColor: "#ffebee", 
            color: "#c62828", 
            padding: "15px", 
            border: "1px solid #c62828",
            marginBottom: "20px",
            borderRadius: "5px",
            textAlign: "center"
        }}> 
          <h2> Accessibility Error: Every uploaded image must have an Alt Text description. </h2>
        </div>
      )}
      
      {possibleErrors.incompleteForm ? (
        <div className="incompleteForm"> 
          <h2> Please make sure you fill out all the fields in the form before 
          uploading your project. Adding a video is optional. </h2>
        </div>):(
      <div></div>)}

      <div className="grid-container">
        <div className="grid-project-title-container">
          <div className ="project-title">
            <h2>Project Title: </h2>
            <input id="project-title-input" value={title} onChange={(e) => setTitle(e.target.value)}  />
          </div>
        </div>

        <div className="grid-item description-container">
          <div className ="description">
            <h2>Description: </h2>
            <textarea id="description" value={projDesc} onChange={(e) => setProjDesc(e.target.value)} ></textarea>
          </div>
        </div>  
        
        <div className="alignment">
          <div className="grid-item image-container">
            <div className="image-upload">
              <h2>Upload Image:</h2>
              <input type="file" id="image" className="uploadImage" accept=".jpg, .png, .jpeg" multiple required onChange={handleFileUpload}></input>
              
              {projImages.map((image, index) => (
                <div key={index} style={{
                    marginBottom: "15px", 
                    border: (possibleErrors.missingAltText && !image.altText) ? "2px solid #c62828" : "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "4px"
                }}>
                  <div style={{display: "flex", alignItems: "flex-start"}}>
                      <img 
                        style={{width:"80px", height: "auto", marginRight:"15px"}} 
                        src={image.previewUrl} 
                        alt={`Preview ${index}`} 
                      />
                      <div style={{width: "100%"}}>
                        <div style={{display: "flex", justifyContent: "space-between", marginBottom: "5px"}}>
                            <label style={{display: "block", fontWeight: "bold", fontSize: "0.9em"}}>
                               Alt Text (Required for Accessibility):
                            </label>
                            <button 
                                onClick={() => handleRemoveImage(index)}
                                style={{
                                    color: 'white', 
                                    backgroundColor: '#d9534f',
                                    border: 'none', 
                                    borderRadius: '4px',
                                    padding: '2px 8px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Remove Image
                            </button>
                        </div>
                        <textarea
                          type="text"
                          value={image.altText}
                          onChange={(e) => handleAltTextChange(index, e.target.value)}
                          className="textarea-design"
                          placeholder="Describe this image for screen readers..."
                          style={{
                              width: "100%",
                              padding: "5px",
                              minHeight: "50px"
                          }}
                        />
                      </div>
                  </div>
                </div>
              ))}

            </div>
          </div>

          <div className="grid-item video-container">
            <div className="video-upload"> 
              <h2>Upload Video:</h2>
              <input type="url" id ="url" name="url" value={projVideo} onChange={(e) => setProjVideo(e.target.value)}></input>
              <h2>Video Description:</h2>
              <textarea id="video-description" name="video-description" rows="3" placeholder="Enter video description"></textarea>
              <h2 style={{marginTop: '15px'}}>Upload ASL Video:</h2>
              <input 
                type="url" 
                id ="asl-url" 
                name="asl-url" 
                value={aslVideo} 
                onChange={(e) => setAslVideo(e.target.value)}
                disabled={!adminUser} 
                placeholder={adminUser ? "Enter ASL video URL" : "Admin access required"}
              />
            </div>
          </div>
        </div>

        <SuppliesContent quantity={quantity} setQuantity={setQuantity} 
          itemName={itemName} setItemName={setItemName} items={items}
          setItems={setItems}
        />
        <SkillsContent list={generalList} skills={skills} setSkills={setSkills}/>
        <RelevantTagsContent list={generalList} typedTag={typedTag} 
          setTypedTag={setTypedTag}
        /> 
      
        <div className="grid-item submit"> 
          {editMode ? ( 
            <div>
              <button className="submit-button" onClick={handleUpdate}>Update</button>
            </div>
          ):(
            <div>
               <button className="submit-button" onClick={handleSubmit}>Submit</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}