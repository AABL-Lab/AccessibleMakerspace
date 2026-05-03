import React, {useEffect, useState} from 'react';
import ProjCard from "../Components/projCard";
import axios from 'axios';

// todo 
// 1. create restriction of how many cards on page  -> const projectsPerpage = 12; 
// 2. implement search 

export default function Project(){
  const [idList, setIdList] = useState([]);
  const [projectInfo, setProjects] = useState([]);
  const [selectedTag, setSelectedTag] = useState("All");
  const [showAllTags, setShowAllTags] = useState(false);

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

  function parseProjectTags(tags){
    if (Array.isArray(tags)) {
      return tags
        .map(tag => Array.isArray(tag) ? tag[0] : tag)
        .filter(tag => typeof tag === 'string' && tag.trim() !== '')
        .map(tag => tag.trim());
    }

    if (typeof tags === 'string' && tags.trim() !== '') {
      return tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
    }

    return ["Untagged"];
  }

  function groupProjectsByTags(projects){
    return projects.reduce((groups, project) => {
      const tags = parseProjectTags(project.tags);

      tags.forEach(tag => {
        if (!groups[tag]) {
          groups[tag] = [];
        }
        groups[tag].push(project);
      });

      return groups;
    }, {});
  }

  const groupedProjects = groupProjectsByTags(projectInfo);
  const groupNames = Object.keys(groupedProjects).sort((a, b) => a.localeCompare(b));
  const visibleGroupNames = showAllTags ? groupNames : groupNames.slice(0, 12);
  const hiddenTagCount = groupNames.length - visibleGroupNames.length;
  const displayedProjects = selectedTag === "All" ? projectInfo : groupedProjects[selectedTag] || [];

  return (
    <div>
      <div className="projectGroups">
        <div className="projectTagFilter" aria-label="Filter projects by tag">
          <button
            className={selectedTag === "All" ? "projectTagFilterButton active" : "projectTagFilterButton"}
            onClick={() => setSelectedTag("All")}
          >
            All
          </button>
          {visibleGroupNames.map(groupName => (
            <button
              key={groupName}
              className={selectedTag === groupName ? "projectTagFilterButton active" : "projectTagFilterButton"}
              onClick={() => setSelectedTag(groupName)}
            >
              {groupName}
            </button>
          ))}
          {groupNames.length > 12 ? (
            <button
              className="projectTagFilterButton projectTagToggleButton"
              onClick={() => setShowAllTags(!showAllTags)}
            >
              {showAllTags ? "Show fewer tags" : `Show ${hiddenTagCount} more tags`}
            </button>
          ) : null}
        </div>

        <section className="projectGroup">
          <h2 className="projectGroupTitle">{selectedTag === "All" ? "All Projects" : selectedTag}</h2>
          <div className='cardLayout'>
            {displayedProjects.map(elem => (
              // send the project's information to the projCard component to create a custom card for each project
              <ProjCard key={elem.projid} id={elem.projid} info={elem}/>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};