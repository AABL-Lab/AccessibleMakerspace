// This is the file for project controls
// The functions here are for controlling projects

const { client, Connection } = require('pg');
const { deleteProjectComments } = require('./comments')
const cloudinary = require('./cloudinary');

let {connect, filter_content, validateUser, getUserID, cleanId, listToString, stringToList, stringToSpacedString, updateGlobalTags, setGlobalTags, globalTags, getGlobalTags} = require('./server');
// const { query } = require('express');

// This function gets all the projects
async function getProjects(client){
    console.log("Getting All Projects");
    try{
      // client = await connect();
    
      results = await client.query('SELECT * from projects');
    
      // client.end();
  
      console.log("Client Connection Closed in getProjects");

      projects = results.rows

      for (let i = 0; i < projects.length; i++) {
        if (projects[i].supplies != null){
          projects[i].supplies = stringToSpacedString(projects[i].supplies);
        }
  
        // console.log(projects[i].supplies);
  
        if (projects[i].skills != null){
          projects[i].skills = stringToSpacedString(projects[i].skills);
        }
        
        // console.log(projects[i].skills);
  
        if (projects[i].tags != null){
          projects[i].tags = stringToSpacedString(projects[i].tags);
        }
        
        // console.log(projects[i].tags);
      }
  
      return projects;
    }
    catch (err){
      console.log("ERROR: " + err);
      return "sad";
    }
  }

// This functions gets a project when given a project id
  async function getProjectID(client, projID){
    console.log("Getting Single Project");
  
    try{
      console.log("Connecting getProj");
      // client = await connect();
    
      console.log("Sending Query getProj");
      results = await client.query('SELECT * from projects where projid = ' + cleanId(projID));
    
      console.log("Finished getProj");
    
      if (results.rows[0].supplies != null){
        // console.log(results.rows[0].supplies)
        results.rows[0].supplies = stringToList(results.rows[0].supplies);
      }

      console.log(results.rows[0].supplies);

      if (results.rows[0].skills != null){
        results.rows[0].skills = stringToList(results.rows[0].skills);
      }
      
      console.log(results.rows[0].skills);

      if (results.rows[0].tags != null){
        results.rows[0].tags = stringToList(results.rows[0].tags);
      }
      
      // console.log("Project Supplies")
      // console.log(results.rows[0].supplies);
      
      console.log("Ending getProj");

      return results.rows[0];
    }
    catch (err){
      console.log("ERROR: " + err);
      return "sad";
    }
  
  }

// This function gets a projets creator from a projecid
  async function getProjectCreator(client, projID){
    try {
      // console.log("Get User ID Type: " + typeof projID)
      if (typeof projID != 'number') {throw("Invalid Project ID Type")}
      userid = await client.query("SELECT userid FROM projects WHERE projid = " + projID);
      userid = userid.rows[0].userid;
      // console.log(userid)
      return userid;
    }
    catch (error){
      console.log("Get Project Creator Error: " + error);
      return -1;
    }
  }

// This function deletes a project
  async function deleteProject(client, userName, password, projID){
    try{
      if (typeof userName != 'string') {throw ("Invalid Username Type")}
      if (typeof password != 'string') {throw ("Invalid Password Type")}
      if (typeof projID != 'number') {throw ("Invalid Project ID Type")}
      neededID = await getProjectCreator(client, projID);
      // console.log(neededID);
      if (neededID >= 0) {  
        if (await validateUser(client, filter_content(userName), password, neededID)){
          let query = "DELETE FROM projects WHERE projID = " + projID + ";";
          console.log("Query: " + query + "\nUsername: " + userName);
          await client.query(query);

          await deleteProjectComments(client, projID);

          try {
            const folderName = "id" + projID;
            console.log(`Deleting Cloudinary assets from folder: ${folderName}`);
            
            // Delete all images/videos inside the folder
            await cloudinary.api.delete_resources_by_prefix(folderName);
            
            // Delete the (now empty) folder
            await cloudinary.api.delete_folder(folderName);
            
            console.log(`Successfully deleted Cloudinary folder: ${folderName}`);
          } catch (cloudinaryError) {
            console.error("Cloudinary Deletion Error: ", cloudinaryError);
          }

          return true;
        }
        return false;
      }
      else {throw("User Does Not Exist")}
    }
    catch(error){
      console.log("Delete Project Error: " + error)
      return error;
    }

  }

// The function creates a project
  async function createProject(client, userName, password, title, description, videoURL, aslURL,  supplies, skills, tags){
    console.log("Creating project from user: " + userName);
    try{
        if (typeof userName != 'string') throw("Username Not Valid");
        if (typeof password != 'string') throw("Password Not Valid");
        if (typeof title != 'string' || title == "") throw("Title Not Valid");
        if (typeof description != 'string' || description == "") throw("Description Not Valid");

        userName = filter_content(userName);
        // password = filter_content(password);
        // console.log("Here");
        // videoURL = filter_content(videoURL);
        // aslURL = filter_content(aslURL);
        title = filter_content(title);
        description = filter_content(description);
        // supplies = filter_content(supplies);
        // skills = filter_content(skills);
        // tags = filter_content(tags);
        // userID = await getUserID(client, userName);

        let today = new Date();
        // console.log(today)
        let month = String(today.getMonth() + 1).padStart(2, '0');
        let day = String(today.getDate()).padStart(2, '0');
        let year = String(today.getFullYear());
        // console.log(today.getDate());
        let date = month + "-" + day + "-" + year;

        console.log(date);
        
        if (! await validateUser(client, userName, password)){
            throw("User Not Valid");
        }

        createProjectQuery1 = "INSERT INTO projects (userid, title, description";
        createProjectQuery2 = "VALUES (" + await getUserID(client, userName) + ", '" + title + "', '" + description + "'";

        if (videoURL != undefined){
          createProjectQuery1 += ", videoURL";
          createProjectQuery2 += ", '" + filter_content(videoURL) + "'";
        }

        if (aslURL != undefined){
          createProjectQuery1 += ", aslURL";
          createProjectQuery2 += ", '" + filter_content(aslURL) + "'";
        }

        if (supplies != undefined){
          createProjectQuery1 += ", supplies";
          createProjectQuery2 += ", '" + listToString(supplies) + "'";
        }

        if (skills != undefined){
          createProjectQuery1 += ", skills";
          await updateGlobalTags(skills)
          skills = listToString(skills)
          // console.log(skills);
          createProjectQuery2 += ", '" + skills + "'";
        }

        if (tags != undefined){
          createProjectQuery1 += ", tags";
          // console.log(tags)
          await updateGlobalTags(tags)
          tags = listToString(tags)
          // console.log(tags)
          createProjectQuery2 += ", '" + tags + "'";
        }


        createProjectQuery1 += ", created)"
        createProjectQuery2 += ", '" + date + "')"

        // console.log(createProjectQuery1)
        // console.log(createProjectQuery2)

        let query = createProjectQuery1 + "\n" + createProjectQuery2 + " RETURNING projid";

        console.log(query);

        let result = await client.query(query);
        result = result.rows[0].projid;

        return Number(result);
    }
    catch (error){
        console.log("Create Project Error: " + error);
        return error;
    }
  }

// This function edits a project
  async function editProject(client, username, password, projID, title, description, videoURL, aslURL, supplies, skills, tags){
    try {
      if (typeof client != 'object') {throw ("Client Invalid type")}
      if (typeof username !=  'string') {throw ("Username Type Invalid")}
      if (typeof password != 'string') {throw ("Password Type Invalid")}
      if (typeof projID != 'number') {throw("ProjID Type Invalid")}
      // console.log("Sphere " + title + " " + typeof(title));
      if (title != undefined && typeof title != 'string') {throw("Title Type Invalid")}
      if (description != undefined && typeof description != 'string') {throw("Description Type Invalid")}
      if (videoURL != undefined && typeof videoURL != 'string') {throw("Video URL type invalid")}
      if (aslURL != undefined && typeof aslURL != 'string') {throw("ASL URL Type Invalid")}
      // console.log("Sphere " + supplies + " " + typeof supplies);
      if (supplies != undefined && !Array.isArray(supplies)) {throw("Supplies Type Invalid")}
      // console.log("Sphere " + skills + " " + typeof skills);
      if (skills != undefined && !Array.isArray(skills)) {throw("Skills Type Invalid")}
      if (tags != undefined && !Array.isArray(tags)) {throw("Tags Type Invalid")}
      username = filter_content(username);

      if (await validateUser(client, username, password, await getProjectCreator(client, projID)) == true){
        console.log("Sphere title: " + title)
        if (title != undefined){
          console.log("Sphere " + title)
          let query = "UPDATE projects SET title = '" + filter_content(title) + "' WHERE projid = " + projID + " RETURNING title";
          let result = await client.query(query);
          // console.log(result.rows[0])
          if (result.rows[0].title != title){
            throw("Title Not Changed");
          }
        }

        if (description != undefined){
          let query = "UPDATE projects SET description = '" + filter_content(description) + "' WHERE projid = " + projID + " RETURNING description";
          let result = await client.query(query)
          if (result.rows[0].description != description){
            throw("Description Not Changed")
          }
        }

        if (videoURL != undefined){
          let query = "UPDATE projects SET videoURL = '" + filter_content(videoURL) + "' WHERE projid = " + projID + " RETURNING videoURL"
          let result = await client.query(query)
          // console.log(result.rows[0].videourl)
          if (result.rows[0].videourl != videoURL){
            throw("Video URL not changed")
          }
        }

        if (aslURL != undefined){
          let query = "UPDATE projects SET aslURL = '" + filter_content(aslURL) + "' WHERE projid = " + projID + " RETURNING aslURL"
          let result = await client.query(query)
          if (result.rows[0].aslurl != aslURL){
            throw("ASL URL Not Changed")
          }
        }

        if (supplies != undefined){
          let query ="UPDATE projects SET supplies = '" + listToString(supplies) + "' WHERE projid = " + projID + " RETURNING supplies"
          let result = await client.query(query)
          if (result.rows[0].supplies != listToString(supplies)){
            throw("Supplies Not Changed")
          }
        }

        if (skills != undefined){
          let query = "UPDATE projects SET skills = '" + listToString(skills) + "'WHERE projid = " + projID + " RETURNING skills"
          let result = await client.query(query)
          if (result.rows[0].skills != listToString(skills)){
            throw("Skills Not Changed")
          }

        }

        if (tags != undefined){
          let query = "UPDATE projects SET tags = '" + listToString(tags) + "'WHERE projid = " + projID + " RETURNING tags"
          let result = await client.query(query)
          if (result.rows[0].tags != listToString(tags)){
            throw("Tags Not Changed")
          }
        }

        // console.log("Poo")

        return true;
      }
      else {
        throw("Invalid User")
      }
    }
    catch(error){
      console.log("Edit Project Error: " + error)
      return error
    }
  }

  async function testCreateProject(Connection){
    console.log("Testing Create Project");

    // console.assert(await createProject(Connection, "JLawton10", "12345678910", "Fun", "Sillieness"));

    if (await createProject(Connection, "JLawton10", "Poop", "Fun", "Sillyness") != "User Not Valid") {throw("Creating Project with invalid user failed")};

    if (typeof (await createProject(Connection, "JLawton10", "12345678910", "Fun", "Sillieness", "O_nb6Z1k5nE", "IgdzsekAo5s", ["I like Supplies", "I like Flying"], ["I am good at things", "I am very sleepy", "Coding"], ["I have a lot of tags", "I can drive a car"])) != 'number') {throw("Project Not Created Successfully")};

    if (typeof (await createProject(Connection, "JLawton10", "12345678910", "Fun", "", "O_nb6Z1k5nE", "IgdzsekAo5s", ["I like Supplies", "I like Flying"], ["I am good at things", "I am very sleepy", "Coding"], ["I have a lot of tags", "I can drive a car"])) != 'string') {throw ("Project Not Created Unsuccessfully")}

    if (typeof (await createProject(Connection, "JLawton10", "12345678910", "", "", "O_nb6Z1k5nE", "IgdzsekAo5s", ["I like Supplies", "I like Flying"], ["I am good at things", "I am very sleepy", "Coding"], ["I have a lot of tags", "I can drive a car"])) != 'string') {throw ("Project Not Created Unsuccessfully")}

    if (typeof (await createProject(Connection, "JLawton10", "12345678910", "", "Silliness", "O_nb6Z1k5nE", "IgdzsekAo5s", ["I like Supplies", "I like Flying"], ["I am good at things", "I am very sleepy", "Coding"], ["I have a lot of tags", "I can drive a car"])) != 'string') {throw ("Project Not Created Unsuccessfully")}
  }

  async function testDeleteProject(Connection){

    // console.log("Delete Projects");
    let result = await createProject(Connection, "JLawton10", "12345678910", "Delete Test", "More Testing");
    // console.log("Project Created for Delete Project")
    // console.log(typeof result);

    if (typeof result != 'number') {throw("Project Not Created For Deletion")};

    projID = await Connection.query("SELECT projid FROM projects WHERE title = 'Delete Test';");

    projID = Number(projID.rows[projID.rows.length-1].projid)
    // console.log(projID);
    // console.log(result);

    if (projID != result) {throw("Poject ID Not Good")}

    if (!(await deleteProject(Connection, "JLawton10", "Goober", projID) == false)) {throw("Deleting Project Failed Succsessfully")};

    if (!(await deleteProject(Connection, "O'Brian", "Oh'Fun", projID) == false)) {throw("Deleting Project Failed Succsessfully")};

    if (!(await deleteProject(Connection, "JLawton10", "12345678910", projID) == true)) {throw("Deleting Project Failed")}

    // console.log("Here");

    result = await createProject(Connection, "O'Brian", "Oh'Fun", "Delete Test", "More Testing");


    if (typeof result != 'number') {throw("Project Not Created For Deletion")};

    if (!(await deleteProject(Connection, "JLawton10", "12345678910", result))) {throw("Deleting Project Failed")}


    
    console.log("Here");

    results = (await Connection.query("SELECT projid FROM projects WHERE title = 'Delete Test';")).rows

    console.log(results);
    if (results.length != 0) {
      // console.log("JavaScript Bad");
      // console.log(results)
      // console.assert(results == []);
      throw("Testing Delete Project Failed")};

  }

  async function editProjectTest(Connection){
    console.log("Testing Edit Project")
    let ID = await createProject(Connection, "JLawton10", "12345678910", "Edit Test", "Edit Test Des", "Edit Test URL", "Edit Test ASL", ["CAD"], ["CODING"], ["FUN"]);

    if (typeof ID != 'number') {throw("Project Not Created Successfully")}

    // if (typeof client != 'object') {throw ("Client Invalid type")}
    //   if (typeof username !=  'string') {throw ("Username Type Invalid")}
    //   if (typeof password != 'string') {throw ("Password Type Invalid")}
    //   if (typeof projID != 'number') {throw("ProjID Type Invalid")}
    //   if (title != undefined || typeof title != 'string') {throw("Title Type Invalid")}
    //   if (description != undefined || typeof description != 'string') {throw("Description Type Invalid")}
    //   if (videoURL != undefined || typeof videoURL != 'string') {throw("Video URL type invalid")}
    //   if (aslURL != undefined || typeof aslURL != 'string') {throw("ASL URL Type Invalid")}
    //   if (supplies != undefined || Array.isArray(supplies)) {throw("Supplies Type Invalid")}
    //   if (skills != undefined || Array.isArray(skills)) {throw("Skills Type Invalid")}
    //   if (tags != undefined || Array.isArray(tags)) {throw("Tags Type Invalid")}
    
    if (await editProject("Connection", "JLawton10", "12345678910", ID, "Title Changed", "Description Changed", "Video Changed", "ASL Changed", ["Soldering"], ["Math"], ["Robotics"]) != "Client Invalid type") {throw("Bad Client Failed")}
    if (await editProject(Connection, 17, "12345678910", ID, "Title Changed", "Description Changed", "Video Changed", "ASL Changed", ["Soldering"], ["Math"], ["Robotics"]) != "Username Type Invalid") {throw("Bad Username Failed")}
    if (await editProject(Connection, "JLawton10", 12345678910, ID, "Title Changed", "Description Changed", "Video Changed", "ASL Changed", ["Soldering"], ["Math"], ["Robotics"]) != "Password Type Invalid") {throw("Bad Password Failed")}
    if (await editProject(Connection, "JLawton10", "12345678910", "ID", "Title Changed", "Description Changed", "Video Changed", "ASL Changed", ["Soldering"], ["Math"], ["Robotics"]) != "ProjID Type Invalid") {throw("Bad ID Failed")}
    if (await editProject(Connection, "JLawton10", "12345678910", ID, 10, "Description Changed", "Video Changed", "ASL Changed", ["Soldering"], ["Math"], ["Robotics"]) != "Title Type Invalid") {throw("Bad Title Failed")}
    // console.log("Here")
    if (await editProject(Connection, "JLawton10", "12345678910", ID, "Title Changed", 12, "Video Changed", "ASL Changed", ["Soldering"], ["Math"], ["Robotics"]) != "Description Type Invalid") {throw("Bad Description Failed")}
    if (await editProject(Connection, "JLawton10", "12345678910", ID, "Title Changed", "Description Changed", 14, "ASL Changed", ["Soldering"], ["Math"], ["Robotics"]) != "Video URL type invalid") {throw("Bad Video Failed")}
    if (await editProject(Connection, "JLawton10", "12345678910", ID, "Title Changed", "Description Changed", "Video Changed", 16, ["Soldering"], ["Math"], ["Robotics"]) != "ASL URL Type Invalid") {throw("Bad ASL Failed")}
    if (await editProject(Connection, "JLawton10", "12345678910", ID, "Title Changed", "Description Changed", "Video Changed", "ASL Changed", "Soldering", ["Math"], ["Robotics"]) != "Supplies Type Invalid") {throw("Bad Supplies Failed")}
    if (await editProject(Connection, "JLawton10", "12345678910", ID, "Title Changed", "Description Changed", "Video Changed", "ASL Changed", ["Soldering"], "Math", ["Robotics"]) != "Skills Type Invalid") {throw("Bad Skills Failed")}
    if (await editProject(Connection, "JLawton10", "12345678910", ID, "Title Changed", "Description Changed", "Video Changed", "ASL Changed", ["Soldering"], ["Math"], "Robotics") != "Tags Type Invalid") {throw("Bad Tags Failed")}




    if (await editProject(Connection, "JLawton10", "12345678910", ID, "Title Changed", "Description Changed", "Video Changed", "ASL Changed", ["Soldering"], ["Math"], ["Robotics"]) != true) {throw("Project Not Edited")}

    let result = await Connection.query("SELECT * FROM projects WHERE projid = " + ID)

    result = result.rows[0]

    if (result.title != "Title Changed") {throw("Title Not Changed in Server")}
    if (result.description != "Description Changed") {throw("Description Not Changed in Server")}
    if (result.videourl != "Video Changed") {throw("Video URL Not Changed in Server")}
    if (result.aslurl != "ASL Changed") {throw("ASL URL Not Changed in Server")}
    if (result.supplies != listToString(["Soldering"])) {throw("Supplies Not Changed in Server")}
    if (result.skills != listToString(["Math"])) {throw("Skills Not Changed in Server")}
    if (result.tags != listToString(["Robotics"])) {throw("Tags Not Changed in Server")}

    if (await editProject(Connection, "JLawton10", "12345678910", ID) != true) {throw("Project Not Edited")}

    if (result.title != "Title Changed") {throw("Title Not Changed in Server")}
    if (result.description != "Description Changed") {throw("Description Not Changed in Server")}
    if (result.videourl != "Video Changed") {throw("Video URL Not Changed in Server")}
    if (result.aslurl != "ASL Changed") {throw("ASL URL Not Changed in Server")}
    if (result.supplies != listToString(["Soldering"])) {throw("Supplies Not Changed in Server")}
    if (result.skills != listToString(["Math"])) {throw("Skills Not Changed in Server")}
    if (result.tags != listToString(["Robotics"])) {throw("Tags Not Changed in Server")}



    if (await deleteProject(Connection, "JLawton10", "12345678910", ID) != true) {throw("Project Not Deleted")}

  }

// let globalTags;
  async function main(){
    console.log("Hello World");

    const Connection = await connect();

    await setGlobalTags();

    console.log("here");

    // console.log(getGlobalTags());

    // await updateGlobalTags([]);

    await testCreateProject(Connection);

    // result = await getProjectID(Connection, "12");

    // console.log(result);

    // console.log(globalTags);

    // await testDeleteProject(Connection);

    // await editProjectTest(Connection)

    Connection.end();


  }

  // main();

module.exports = {getProjects, getProjectID, createProject, editProject, deleteProject};
