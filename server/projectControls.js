const cloudinary = require ("./cloudinary");
const express = require("express");
const path = require("path");
const app = express();
const multer = require('multer');
// const fs = require('fs')
// const { Client, Connection } = require('pg');
const {connect, tags, setGlobalTags, getGlobalTags, validateUser, filter_content} = require('./server');
const {getProjects, getProjectID, createProject, editProject, deleteProject} = require('./projects');
const users = require('./users.js');
const comments = require('./comments.js')
const server = require('./server.js')
// const { default: userEvent } = require("@testing-library/user-event");
// const { click } = require("@testing-library/user-event/dist/click.js");
// const { upload } = require("@testing-library/user-event/dist/upload.js");
// const { Await } = require("react-router-dom");
// import connect from './server';
// TODO: remeber we added proxy to our JSON file to be removed
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

const mult = multer();


// Middleware to parse JSON body
app.use(express.json());

// Search the cloudinary database for image based on project id
async function searchByFolder(id){
  console.log("Inside Search by Folder");
  try {
    const result = await cloudinary.search
      .expression(`folder=${id}`)
      .with_field('context') // UPDATED: Request metadata (alt text)
      .max_results(30)
      .execute()
    console.log("Cloudinary Search Results: " + result);
    const processedImages = processJsonResults(result);
    return processedImages;
  }catch (error) {
    console.error('Error:', error);
    return []
  }
}

async function uploadImage(images, altTexts, projID){
  console.log("Upload image to Cloudinary API");
  console.log("projID: ", projID);
  console.log(typeof(images));
  
  try {
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const altText = altTexts && altTexts[i] ? altTexts[i] : "";
      const uploadedImage = await cloudinary.uploader.upload(file, {
        folder: projID, 
        context: `alt=${altText}`
      });
    }

    console.log("image sent");
    return true;
  }catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Parse through cloudinary results grabbing each photo's secure_url
function processJsonResults(imageData){
  let images = [];
  imageData.resources.forEach(photo => {
    let alt = "Project Image"; // Default

    if (photo.context && photo.context.custom && photo.context.custom.alt) {
        alt = photo.context.custom.alt;
    }

    else if (photo.context && photo.context.alt) {
        alt = photo.context.alt;
    }
    
    images.push({ 
        url: photo.secure_url, 
        alt: alt 
    });
  });
  return images;
}

app.post('/api/uploadImage', mult.array('images'), async (req, res) => {
  console.log("Uploading Pictures")

  try {
    projid = req.body.projid
    username = req.body.username
    password = req.body.password
    console.log("username: " + username)
    console.log("projid:" + projid)
  
    let query = "select userid from projects where projid = " + projid
  
    console.log(query)
  
    neededid = (await connection.query(query)).rows[0].userid
  
    console.log("Needed id:")
    console.log(neededid)
  
    if ((await validateUser(connection, filter_content(username), password, neededid)) == true){
      // Expecting Base64 strings in req.body.images
      let images = req.body.images
      if (typeof images == 'string'){
        images = [images]
      }

      // Extract Alt Texts
      let altTexts = req.body.altTexts;
      if (typeof altTexts == 'string') altTexts = [altTexts];
      if (!altTexts) altTexts = [];
    
      // Pass to helper
      uploadImage(images, altTexts, "id" + projid);
      res.send(true)
    }
  
    else{
      console.log("Invalid User")
      res.status(500).json({ error: "We are having fun" });;
    }
  }
  catch (error){
    console.log("Upload Image API Error: " + error)
    return error
  }
})


app.post('/api/replaceImages', mult.array('images'), async (req, res) => {
  console.log("Replacing Project Pictures (Delete & Upload)");

  try {
    const projid = req.body.projid;
    const username = req.body.username;
    const password = req.body.password;
    const folderName = `id${projid}`;


    let query = "select userid from projects where projid = " + projid;
    let dbResult = await connection.query(query);
    
    if(dbResult.rows.length === 0) {
        return res.status(404).json({ error: "Project not found" });
    }

    let neededid = dbResult.rows[0].userid;

    if ((await validateUser(connection, filter_content(username), password, neededid)) === true) {
      
      try {
        console.log(`Deleting existing resources in folder: ${folderName}`);
        await cloudinary.api.delete_resources_by_prefix(folderName);
      } catch (delErr) {
        console.log("Error deleting old images (folder might be empty or API not enabled): ", delErr.message);
        // Proceeding anyway to upload new images
      }

      let images = req.body.images;
      if (typeof images == 'string') images = [images];
      if (!images) images = [];

      let altTexts = req.body.altTexts;
      if (typeof altTexts == 'string') altTexts = [altTexts];
      if (!altTexts) altTexts = [];

      await uploadImage(images, altTexts, folderName);
      
      res.send(true);
    } else {
      console.log("Invalid User for Replace Images");
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.log("Replace Image API Error: " + error);
    res.status(500).json({ error: error.message });
  }
});

// Recieving request from user and send back the image urls from Cloudinary 
app.post('/api/data', async (req, res) => {
  console.log("Cloudinary API Recieved");
  try {
    const requestData = req.body.id;
    console.log("Request Generated, Request Data: " + requestData);
    const searchResult = await searchByFolder(requestData);
    console.log("Search Complete, Results: " + searchResult);
    res.send(searchResult);
    console.log("Sent Results");
  }catch (error) {
    res.status(500).json({ error: error.message });
  }});

//parse the projects to get id, tags, title 
function parseProjects(projects){
  console.log("inside parse");
  let cardProjectInfo = [];
  projects.forEach(project => {
  const { projid, title, tags } = project;
  cardProjectInfo.push({ projid, title, tags });
  });
  return cardProjectInfo;
}
// Recieving project request from user to back end 
app.post('/api/projects', async (req, res) => {
  console.log("inside app post");
  try {
    projects = await getProjects(connection);
    const results = parseProjects(projects);
    res.send(results);
  }catch (error) {
    // return "error";
    res.status(500).json({ error: error.message });
  }});

app.post('/api/project', async (req, res) => {
  console.log("Inside project API");
  try {
    project = await getProjectID(connection, req.body.id);
    console.log("Got project: " + project);
    res.send(project);
  }
  catch (error) {
    console.log("Error: " + error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/signUp', async (req, res) => {
  console.log("Inside Sign Up API");
  console.log(req.body.userName, req.body.password, req.body.email);
  try {
    result = await users.createUser(connection, req.body.userName, req.body.password, req.body.email);
    if (result == "YAY!!!"){
      res.send("1");
    }
    else if (result = "User already exists"){
      res.send(result);
    }
    else if (result == "sad"){
      throw("Something Broke")
    }
  }
  catch (error){
    console.log("Error: " + error);
    res.status(500).json({ error: error.message });
  }
})

app.post('/api/createProject', async (req, res) => {
  console.log("Creating Project")
  try {
    let videoURL = undefined;
    let aslURL = undefined;
    let supplies = undefined;
    let skills = undefined;
    let tags = undefined;

    // console.log("Request Body: " + JSON.stringify(req.body));
    // console.log(req.body.tags)

    try {
      videoURL = req.body.videoURL
    }catch(error){videoURL = undefined}

    try{
      aslURL = req.body.aslURL
    }catch(error){aslURL = undefined}

    try{
      // console.log("Supplies")
      supplies = req.body.supplies.map(supply => supply.quantity + '_' + supply.itemName)
      console.log(supplies)
    }catch(error){supplies = undefined}

    try{
      // skills = req.body.skill.map(skill => skill.skill)
      console.log("Skills")
      console.log(req.body.skill)
      skills = req.body.skill.map(skill => skill.skill + '_' + skill.skillLevel)
    }catch(error){skills = undefined}

    try{
      tags = req.body.tags
    }catch(error){
      // console.log("Project Upload Tags Error: " + error)
      tags = undefined}

    // console.log("Upload Project Skills: " + tags);
    // console.log("Request Skills: " + req.body.tags);
    
    // console.log("Hello")
    // async function createProject(client, userName, password, title, description, videoURL, aslURL, supplies, skills, tags){ 
    result = await createProject(connection, req.body.userName, req.body.password, req.body.title, req.body.description, videoURL, aslURL, supplies, skills, tags)
    // globalTags = await setGlobalTags();
    // result = parseInt(result)
    res.send(String(result))
    // console.log(result);

    // Comeback and fix this
    // if (typeof result != 'number'){
    //   throw("Project Not Created");
    // }
    // const newProjID = parseInt(result);
    // console.log(typeof(numberResult));
    // if (typeof result != 'number'){ 
    //   throw("Project Not Created");
    // }
    // getProjectID(connection, req.body.id);
    // Dealing with images TODO: I need the projectID somehow 
    // let images = req.body.projImages;
    // if (req.body.projImages instanceof FormData){
    //   console.log("We are of Type Form Data")
    // }
    // else(
    //   console.log("We are not of type Form Data")
    // )
    // console.log("Images: ")
    // console.log(images);
    // error = await uploadImage(images, result);
    // if (error != true){
    //   throw("Images Not Uploaded");
    // }
    //TODO: Possible bug here
    // res.send(error);
  }
  catch (error) {
    console.log("Error: " + error);
    res.status(500).json({ error: error.message });
  }
})

app.post("/api/editProject", async(req, res) => {
  console.log("Editing a project API")
  try {

    let title = undefined;
    let description = undefined;
    let videoURL = undefined;
    let aslURL = undefined;
    let supplies = undefined;
    let skills = undefined;
    let tags = undefined;

    // console.log("Request Body: " + JSON.stringify(req.body));
    // console.log(req.body.tags)

    try {
      title = req.body.title
    }catch(error){title = undefined}

    try {
      description = req.body.description
    }catch(error){description = undefined}

    try {
      videoURL = req.body.videoURL
    }catch(error){videoURL = undefined}

    try{
      aslURL = req.body.aslURL
    }catch(error){aslURL = undefined}

    try{
      console.log("Supplies")
      supplies = req.body.supplies.map(supply => supply.quantity + '_' + supply.itemName)
      console.log(supplies)
    }catch(error){supplies = undefined}

    try{
      // skills = req.body.skill.map(skill => skill.skill)
      console.log("Skills")
      console.log(req.body.skill)
      skills = req.body.skill.map(skill => skill.skill + '_' + skill.skillLevel)
    }catch(error){skills = undefined}

    try{
      tags = req.body.tags
    }catch(error){
      // console.log("Project Upload Tags Error: " + error)
      tags = undefined}
    // async function editProject(client, username, password, projID, title, description, videoURL, aslURL, supplies, skills, tags){
    let result = await editProject(connection, req.body.username, req.body.password, req.body.projid, title, description, videoURL, aslURL, supplies, skills, tags);
    console.log("editing proj results:",result);
    res.send(result);
  }
  catch(error){
    console.log("Editing a Project API Error: " + error)
    res.status(500).json({ error: error.message });
  }
})

app.post("/api/deleteProject" , async(req, res) => {
  console.log("Deleting Project API Called")
  try {
    console.log("User ID: " + req.body.username)
    console.log(req.body.username)
    let result = await deleteProject(connection, req.body.username, req.body.password, req.body.projid)
    res.send(result);
  }
  catch(error){
    console.log("Deleting a Project API Error: " + error)
    res.status(500).json({ error: error.message });
  }
})

app.post("/api/getUsers", async(req, res) => {
  console.log("Geting Users");
  try {
    let result = await users.getUsers(connection);

    res.send(result);
  }
  catch (error){
    console.log("Error: " + error);
    res.status(500).json({ error: error.message });
  }
})

app.post("/api/getUserByName", async(req, res) => {
  console.log("Get User By Name API");
  try {
    let result = await users.getUserByName(connection, req.body.userName);

    res.send(result);
  }
  catch (error){
    console.log("Error: " + error);
    res.status(500).json({ error: error.message });
  }
})

app.post("/api/getUserProjects", async(req, res) => {
  console.log("Getting User Projects API")
  console.log(req);
  console.log(req.body)
  console.log("req.body.userName: ",req.body.username);
  try {
    let result = await users.getUserProjects(connection, req.body.username);
    console.log("results from getProjects: ", result);
    res.send(result)
  }
  catch (error){
    console.log("Getting User Projects API Error: " + error);
    res.status(500).json({ error: error.message})
  }
})

app.post("/api/logIn", async(req, res) => {
  console.log("Inside logIn api");
  try{
    result = await users.logIn(connection, req.body.userName, req.body.password);
    console.log("User Log In Result: " + result)
    res.send(result);
  }
  catch(error){
    console.log("Error: " + error);
    res.status(500).json({ error: error.message });
  }
})

app.post("/api/getAdmin", async(req, res) => {
  try{
    result = await users.getAdmin(connection, req.body.userName, req.body.password);
    console.log("User admin Result: " + result)
    res.send(result);
  }
  catch(error){
    console.log("Error: " + error);
    res.status(500).json({ error: error.message });
  }
})

app.post("/api/getTags", async(req, res) => {
  console.log("Sending Tags")

  try{
    res.send(getGlobalTags().sort());
  }
  catch(error){
    console.log("Error: " + error);
    res.status(500).json({ error: error.message });
  }
})

app.post("/api/editUser", async(req, res) => {
  console.log("Editing User Profile API")
  try {
    const { 
      currentUsername, 
      currentPassword, 
      newUsername, 
      newPassword, 
      displayName, 
      bio, 
      email 
    } = req.body;

    // Get the userID from the currentUsername
    let userID = await server.getUserID(connection, currentUsername);
    if (userID === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Call the updated editUser function
    let result = await users.editUser(
      connection, 
      userID, 
      currentUsername, 
      currentPassword, 
      newUsername, 
      newPassword, 
      displayName, 
      bio, 
      email
    );
    
    if (result === "success") {
      res.send({ status: "success" });
    } else {
      res.status(400).json({ error: result });
    }
  }
  catch(error){
    console.log("Editing User API Error: " + error)
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/uploadProfilePic', mult.single('profilePic'), async (req, res) => {
  console.log("Uploading Profile Picture")
  try {
    const { username } = req.body;
    const file = req.file; // The uploaded file

    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // 1. Validate user
    let userID = await server.getUserID(connection, username);
    if (userID === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Upload image to Cloudinary
    // We need to upload from the file buffer
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = "data:" + file.mimetype + ";base64," + b64;
    const uploadedImage = await cloudinary.uploader.upload(dataURI, {
      folder: `user_profile/${userID}` // Store in a user-specific folder
    });

    const imageUrl = uploadedImage.secure_url;

    // 3. Save the URL to the database
    let updateResult = await users.editUser(
      connection,
      userID,
      username,
      undefined,
      undefined, // newUsername
      undefined, // newPassword
      undefined, // displayName
      undefined, // bio
      undefined, // email
      imageUrl     // profilePicUrl
    );

    if (updateResult === "success") {
      res.send({ status: "success", profilePicUrl: imageUrl });
    } else {
      res.status(500).json({ error: "Failed to save image URL to database." });
    }
  }
  catch (error){
    console.log("Upload Profile Pic API Error: " + error)
    res.status(500).json({ error: error.message });
  }
})

app.post("/api/deleteUser", async (req, res) => {
  console.log("deleting User")
  try {
    if (await users.deleteUser(connection, req.body.username, req.body.password) == true){
      res.send("User Deleted Successfully");
    }
    else {
      res.send("User Not Deleted");
    }
  }
  catch (error){
    console.log("Error: " + error);
    res.status(500).json({error: error.message});
  }
})

app.post("/api/createComment", async (req, res) => {
  console.log("Creating Comment");
  try {
    let result = await comments.createComment(connection, req.body.username, req.body.password, req.body.projID, req.body.comment)
    if(typeof result == 'number'){
      res.send(true)
    }
    else {
      throw(result)
    } 
  }
  catch(error){
    console.log("Create Comment API Error: " + error)
    res.status(500).json({error: error.message});
  }
})

//created but not implemented in front end
app.post("/api/editComment", async (req, res) => {
  console.log("Editing Comment");
  try {
    let result = await comments.editComment(connection, req.body.username, req.body.password, req.body.commentid, req.body.comment);
    if (result = req.body.comment){
      res.send(true)
    }
    else {
      throw(result)
    }
  }
  catch(error){
    console.log("Edit Comment API Error: " + error)
    res.status(500).json({error: error.message});
  }
})

//created but not implemented in front end
app.post("/api/deleteComment", async (req, res) => {
  console.log("Deleting Comment");
  try {
    let result = await comments.deleteComment(connection, req.body.username, req.body.password, req.body.comentid);
    if (typeof result == 'number'){
      res.send(result);
    }
    else {
      throw(result)
    }
  }
  catch(error){
    console.log("Delete Comment API Error: " + error)
    res.status(500).json({error: error.message});
  }
})

app.post("/api/getProjectComments", async (req, res) => {
  console.log("Geting Project Comments");
  try {
    let result = await comments.getProjectComments(connection, req.body.projID);
    if (Array.isArray(result)){
      res.send(result)
    }
    else {
      throw(result)
    }
  }
  catch (error){
    console.log("Geting Project API Error: " + error)
    res.status(500).json({error: error.message});
  }
})

let connection;
// let globalTags;
app.listen(PORT, async () => {
  await setGlobalTags();
  // console.log(getGlobalTags());
  // console.log("Attempting to Connect");
  connection = await connect();
  console.log("SQL Version");
  console.log(`Server is running on port ${PORT}`);
  // console.log(globalTags);
});
