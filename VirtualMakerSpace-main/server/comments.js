// This file is for anything relating to comments
// I.E. creating comments

const { client, Connection } = require('pg');

const {connect, filter_content, validateUser, getUserID} = require('./server');
// const { query } = require('express');
// const { useActionData } = require('react-router-dom');

// This function creates a comment
async function createComment(client, username, password, projID, comment, parrent = 0){
  try {
    if (typeof username != 'string') {throw("Username Invalid type")}
    if (typeof password != 'string') {throw("Password Invalid Type")}
    if (typeof projID != 'number') {throw("Project ID Invalid Type")}
    if (typeof comment != 'string') {throw("Comment Invalid Type")}
    if (typeof client != 'object') {throw("Client Invalid type")}
    if (typeof parrent != 'number' && parrent != undefined) {throw("Parrent Invalid Type")}
    // if (parrent != 0) {throw("Poop!")}
    username = filter_content(username)
    comment = filter_content(comment)
    if (await validateUser(client, username, password)){
        let the_query = "INSERT INTO comments (userID, projID, content, parentid) VALUES (" + await getUserID(client, username) + ", " + projID + ", '" + comment + "', " + parrent + ") RETURNING commentid";

        console.log(the_query);
        result = (await client.query(the_query)).rows[0].commentid;
        console.log(result);
        return result;

    }
    else {
      throw ("Invalid User");
    }
      // client.query("INSERT INTO comments (userID, projID, content) VALUES (" + userID + ", " + projID +" ,'" +  filter_content(comment) + "');");
    
    
    }
    catch(err){
      console.log("ERROR: " + err);
      return err;
    }
  }

// This function gets a comments creator
  async function getCommentCreator(client, commentid){
    try{
      if (typeof commentid != 'number') {throw("commentid Invalid Type")};
      // console.log(client);
      if (typeof client != 'object') {throw("Client Invalid Type")}
      let the_query = "SELECT userid FROM comments WHERE commentid = " + commentid
      // console.log("Pre Query")
      // console.log(the_query);
      let result = ((await client.query(the_query)));
      // console.log("Post Query")
      // console.log(result)
      result = result.rows[0].userid;
      // console.log(result)
      return result

    }
    catch (error){
      console.log("Get Comment Creator Error: " + error)
      return error;
    }
  }
  async function deleteComment(client, username, password, commentid){
    try{
      if (typeof username != 'string') {throw ("Username Invalid Type")}
      if (typeof password != "string") {throw("Password Invalid Type")}
      if (typeof commentid != "number") {throw("CommentID Invalid Type")}
      if (typeof client != "object") {throw("Client Invalid Type")}
      username = filter_content(username);
      // console.log(commentid);
      // console.log(client.readyForQuery)
      let creator = await getCommentCreator(client, commentid);
      // console.log(creator);
      if (await validateUser(client, username, password, creator)){
        let query = "UPDATE comments SET content = null, userid = 0 WHERE commentid = " + commentid + " RETURNING userid";
        // console.log(query);
        let result = await client.query(query);
        result = Number(result.rows[0].userid)
        // console.log(result)
        return result;
      }
      else {
        throw("Invalid User");
      }


    }
    catch (error){
      console.log("Delete Comment Error: " + error)
      return error;
    }

  }

// This function edits a comment
  async function editComment(client, username, password, commentid, content){
    try {
      // console.log(commentid)
      // console.log(content)
      if (typeof client != 'object') {throw("Client Invalid Type")}
      if (typeof username != 'string') {throw("Username Invalid Type")}
      if (typeof password != 'string') {throw("password Ivalid Type")}
      if (typeof commentid != 'number') {throw("Comment ID Invalid Type")}
      if (typeof content != 'string') {throw("Content Invalid Type")}
      username = filter_content(username);
      content = filter_content(content);
      let creator = await getCommentCreator(client, commentid);
      if (await validateUser(client, username, password, creator)){
        let query = "UPDATE comments SET content = '" + content + "' WHERE commentid = " + commentid + ' RETURNING content'
        // console.log(query);
        let result = await client.query(query);
        result = result.rows[0].content;
        return result;

      }
      else {
        throw("Invalid User");
      }
    }
    catch(error){
      console.log("Edit Comment Error: " + error)
      return error;
    }
  }

// This function gets all of the comments for a given project
  async function getProjectComments(client, projID){
    try{
      if (typeof projID != 'number') {throw ("Project ID Type Invalid")}
      if (typeof client != 'object') {throw ("Client Invalid Type")}
      let query = "SELECT * FROM comments WHERE projid = " + projID;
      console.log(query);
      let result = await client.query(query);
      // console.log("here")
      result = result.rows
      // console.log(result)
      return result
    }
    catch (error){
      console.log("Get Project Comments Error: " + error)
      return error
    }
  }
// THIS FUNCTION SHOULD ONLY EVER BE INTERNALLY FACING
// To make it public, wrap the "fun" parts in a validate user conditional
// This function deletes all of the comments for a given function
  async function deleteProjectComments(client, projID){
    try {
      if (typeof client != 'object') {throw("Invalid Client Type")}
      if (typeof projID != 'number') {throw("Invalid Project ID Type")}
      let query = "DELETE FROM comments WHERE projid = " + projID;
      // console.log(query)
      await client.query(query)
      return true
    }
    catch (error){
      console.log("Delete Project Comments Error: " + error)
      return error;
    }
  }

  async function createCommentTest(Connection){

    if (!(typeof await createComment(Connection, "JLawton10", "12345678910", 1, "This is a good project!!") == 'number')) {throw ("Comment Creation Failed")};
    if ((await createComment("Connection", "JLawton10", "12345678910", 1, "This is a good project!!") != "Client Invalid type")) {throw ("Client Type Failed")};
    if (!(await createComment(Connection, "JLawton10", "12345678910", "1", "This is a good project!!") == "Project ID Invalid Type")) {throw("Project ID Type Failed")};
    if (!(await createComment(Connection, "JLawton10", "12345678910", 1, 17) == "Comment Invalid Type")) {throw("Comment Type Failed")};
    if (!(await createComment(Connection, "JLawton10", 12345678910, 1, "This is a good project!!") == "Password Invalid Type")) {throw("Password Type Failed")};
    if (!(await createComment(Connection, 17, "12345678910", 1, "This is a good project!!") == "Username Invalid type")) {throw("Username Type Failed")};
    if (!(await createComment(Connection, "JLawton10", "17", 1, "This is a good project!!") == "Invalid User")) {throw("User Validated Unsuccessfully Type Failed")};

  }

  async function getCommentCreatorTest(Connection){
    comment = Number((await Connection.query("select commentid from comments where userid = 1")).rows[0].commentid);
    if ((await getCommentCreator(Connection, comment) != 1)) {throw("Creater Gotten Incorrectly")}
    if ((await getCommentCreator(Connection, "comment") != "commentid Invalid Type")) {throw("Creater Gotten Incorrectly")}
    if ((await getCommentCreator("Connection", comment) != "Client Invalid Type")) {throw("Client Gotten Incorrectly")}


  }

  async function deleteCommentTest(Connection){
    let result = await createComment(Connection, "JLawton10", "12345678910", 1, "Delete Comment Test")
    let truth = await Connection.query("SELECT commentid FROM comments where content = 'Delete Comment Test'")
    truth = truth.rows.sort()[truth.rows.length - 1].commentid;
    console.log("NEW truth: " + truth);
    if (result != truth) {throw("Comment Creation Result Failed")}
    if (await deleteComment(Connection, "JLawton10", "12345678910", "1") != "CommentID Invalid Type") {throw("Comment ID type Failed")};
    if (await deleteComment(Connection, "JLawton10", 12345678910, result) != "Password Invalid Type") {throw("Password type Failed")};
    if (await deleteComment(Connection, 1, "12345678910", result) != "Username Invalid Type") {throw("Username type Failed")};
    if (await deleteComment("Connection", "JLawton10", "12345678910", result) != "Client Invalid Type") {throw("Client type Failed")};

    if (await deleteComment(Connection, "JLawton10", "17", result) != "Invalid User") {throw("Invalid User Failed")};
    if (await deleteComment(Connection, "JLawton10", "12345678910", result) != 0) {throw("Comment Not Deleted Succesfully")};
    

    result = await createComment(Connection, "O'Brian", "Oh'Fun", 1, "Delete Comment Test")
    // console.log(result);
    truth = await Connection.query("SELECT commentid FROM Comments where content = 'Delete Comment Test'")
    truth = truth.rows.sort()[truth.rows.length - 1];
    truth = truth.commentid;
    console.log("Truth: " + truth);
    if (result != truth) {throw("Comment Creation Result Failed")}
    if (await deleteComment(Connection, "JLawton10", "12345678910", result) != 0) {throw("Comment Not Deleted Succesfully")};


    result = await createComment(Connection, "O'Brian", "Oh'Fun", 1, "Delete Comment Test")
    truth = await Connection.query("SELECT commentid FROM Comments where content = 'Delete Comment Test'")
    truth = truth.rows.sort()[truth.rows.length - 1].commentid;
    if (result != truth) {throw("Comment Creation Result Failed")}
    if (await deleteComment(Connection, "Harnaljia", "Weber1234", result) != "Invalid User") {throw("Invalid User 2 Failed")};
    if (await deleteComment(Connection, "O'Brian", "Oh'Fun", result) != 0) {throw("Comment Not Deleted Succesfully")};



    truth = await Connection.query("SELECT commentid FROM Comments where content = 'Delete Comment Test'")
    if (truth.rows.length != 0){
      throw("Not all Comments Deleted");
    }
  }

  async function editCommentTest(Connection){

    // client != 'object' {throw("Client Invalid Type")}
    //   if (typeof username != 'string') {throw("Username Invalid Type")}
    //   if (typeof password != 'string') {throw("password Ivalid Type")}
    //   if (typeof commentid != 'number') {throw("Comment ID Invalid Type")}
    //   if (typeof content != 'strtring') {throw("Content Invalid Type")}

    let result = await createComment(Connection, "O'Brian", "Oh'Fun", 1, "Edit Comment Test");
    if (await editComment("Connection", "O'Brian", "Oh'Fun", result, "Comment Edited") != "Client Invalid Type") {throw("Client Invalid Type")}
    if (await editComment(Connection, "O'Brian", "Oh'Fun", "result", "Comment Edited") != "Comment ID Invalid Type") {throw("Comment ID Invalid Type")}
    if (await editComment(Connection, "O'Brian", 17, result, "Comment Edited") != "password Ivalid Type") {throw("Password Invalid Type")}
    if (await editComment(Connection, 17, "Oh'Fun", result, "Comment Edited") != "Username Invalid Type") {throw("Username Invalid Type")}
    // console.log("Here");
    if (await editComment(Connection, "O'Brian", "Oh'Fun", result, 17) != "Content Invalid Type") {throw("Content Invalid Type")}
    if (await editComment(Connection, "Harnaljia", "Weber1234", result, "Comment Edited") != "Invalid User") {throw("Invalid User")}

    if (await editComment(Connection, "O'Brian", "Oh'Fun", result, "Comment Edited") != "Comment Edited") {throw("Commend Not Edited")}
    let truth = await Connection.query("Select Content FROM comments WHERE commentid = " + result)
    truth = truth.rows[0].content
    if (truth != "Comment Edited") {throw("Comment Not Changed In Server")}
    if (await editComment(Connection, "JLawton10", "12345678910", result, "Comment Edited Twice") != "Comment Edited Twice") {throw("Commend Not Edited")}

    truth = await Connection.query("Select Content FROM comments WHERE commentid = " + result)
    truth = truth.rows[0].content
    if (truth != "Comment Edited Twice") {throw("Comment Not Changed In Server")}
    // console.log("HERE!!!!!!!!!");
    if (await deleteComment(Connection, "O'Brian", "Oh'Fun", result) != 0) {throw("Comment Not Deleted")};


  }

  async function testGetProjectComments(Connection){
    if (!Array.isArray(await getProjectComments(Connection, 1))) {throw("Get Project Failed")}
    if (await getProjectComments("Connection", 1) != "Client Invalid Type") {throw("Client Invalid Type Failed")}
    if (await getProjectComments(Connection, "1") != "Project ID Type Invalid") {throw("Project ID Ivalid Type Failed")}
  }

  async function deleteProjectCommentsTest(Connection){
    if (typeof await createComment(Connection, "JLawton10", "12345678910", 17, "Delete Project Test") != 'number') {throw("Comment 1 Not Created")}
    if (typeof await createComment(Connection, "JLawton10", "12345678910", 17, "Delete Project Test") != 'number') {throw("Comment 2 Not Created")}
    if (typeof await createComment(Connection, "JLawton10", "12345678910", 17, "Delete Project Test") != 'number') {throw("Comment 3 Not Created")}
    if (typeof await createComment(Connection, "JLawton10", "12345678910", 17, "Delete Project Test") != 'number') {throw("Comment 4 Not Created")}
    if (typeof await createComment(Connection, "JLawton10", "12345678910", 16, "Delete Project Test") != 'number') {throw("Comment 5 Not Created")}
    let result = await Connection.query("SELECT * FROM comments WHERE content = 'Delete Project Test'")
    if (result.rows.length < 5) {throw("Not all comments Created")}

    // if (typeof client != 'object') {throw("Invalid Client Type")}
    // if (typeof projID != 'number') {throw("Invalid Project ID Type")}
    if (await deleteProjectComments("Connection", 17) != "Invalid Client Type") {throw("Invalid Client Type Failed")}
    if (await deleteProjectComments(Connection, "17") != "Invalid Project ID Type") {throw("Invalied Project ID Type Failed")}

    if (await deleteProjectComments(Connection, 17) != true) {throw("Delete Project Comments Failed")}
    
    result = await Connection.query("SELECT * FROM comments WHERE content = 'Delete Project Test'")
    if (result.rows.length < 1) {throw("All Comments Deleted Incorectly")}

    console.assert(await deleteProjectComments(Connection, 16) == true)



  }

  async function main(){
    console.log("Hellow World");

    let Connection = await connect();

    await createCommentTest(Connection);
    await getCommentCreatorTest(Connection);
    await deleteCommentTest(Connection);
    await editCommentTest(Connection);
    await testGetProjectComments(Connection);
    await deleteProjectCommentsTest(Connection)

    Connection.end();
  }

  // main();

  module.exports = {createComment, editComment, deleteComment, getProjectComments, deleteProjectComments}
