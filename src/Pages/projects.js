import React, {useEffect, useState} from 'react';
import ProjCard from "../Components/projCard";
import axios from 'axios';

// todo 
// 1. create restriction of how many cards on page  -> const projectsPerpage = 12; 
// 2. implement search 

export default function Project(){
  const [idList, setIdList] = useState([]);
  const [projectInfo, setProjects] = useState([]);

  //on page load, get the projects 
  useEffect(() => {
    requestProjects();
  }, []);

  // function makes the project request to backend 
  async function requestProjects () {
    try { //Handle Success
      const response = await axios.post('/api/projects');
      const newidList = response.data.map(element => element.projid);
      setIdList(newidList);
      setProjects(response.data);
      console.log("Finished accessing information");
    } catch (error) { // Handle error
    console.error('Error getting projects:', error);
    }
  }

  return (
    <div>
      {/* Display are the projects from the server */}
      <div className='cardLayout'>
        {/* TODO: STYLE TAGS */}
        {projectInfo.map(elem => (
          // send the project's information to the projCard component to create a custom card for each project 
          <ProjCard key={elem.projid} id={elem.projid} info={elem}/>
        ))}
      </div>
    </div>
  );
};