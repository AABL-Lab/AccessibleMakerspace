import React, { useState, useEffect, useRef } from "react";

// TODO: FIX SHowing of ERROR  skills = [] when in edit mode 

export default function FilterableDropdown({options, hideLevel, skills, setSkills, typedTag = [], setTypedTag, id}){
  const [filterText, setFilterText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(""); 
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("");
  const [selectedTags, setSelectedTags] = useState(""); 
  const [possibleErrors, setPossibleErrors] = useState({
    maxAdditions: false,
    incompleteCompletion: false,
  });

  //onces the list of tags/skills is pulled from server, add options to the dropdown options
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  //when the add button is clicked, we add either the skill or tag to their prefer storage arrays
  const handleActionButtonClick = () => {
    if (id == "skills") {
    if (selectedSkill !== "" && selectedSkillLevel !== ""){
      // note: to not overwhelm users, we set a hard 5 skills & tags limit
      if(skills.length === 5){
        setPossibleErrors(prevState => ({
          ...prevState,
          maxAdditions: true
        }));
      }

      const newSkill = {
        skill: selectedSkill, 
        skillLevel: selectedSkillLevel 
      }; 
      setSkills((prevSkills) => [...prevSkills, newSkill]); 
    }else{ //User didn't complete skills form
      setPossibleErrors(prevState => ({
        ...prevState,
        incompleteCompletion: true
      }));
      return; // Exit the function to prevent adding more skills
    }
    }

    if(typedTag.length === 5){
      console.log(typedTag.length);
      console.log("max hit");
      setPossibleErrors(prevState => ({
          ...prevState,
          maxAdditions: true
      }));
      return; // Exit the function to prevent adding more tags
    }

    if(selectedTags !== ""){
      setTypedTag((prevTag) => [...prevTag, selectedTags]); 
    }
  };

  //when x is clicked, the tag is removed
  const handleRemoveTag = (index) => {
    const updatedTags = [...typedTag];
    updatedTags.splice(index, 1);
    setTypedTag(updatedTags);
  };

  const inputRef = useRef(null);
  //as changes are made to the input box, the dropdown list is filtered to show existing possible options
  const handleInputChange = (e) => {
    console.log("adding");
    setPossibleErrors(prevState => ({
      ...prevState,
      incompleteCompletion: false
    }));
    const searchText = e.target.value;
    setFilterText(searchText);
    setShowDropdown(true); // Always show dropdown when there is text
    // Filter options based on input
    const filtered = options.filter(option =>
      option.toLowerCase().includes(searchText.toLowerCase())
    );

    if(filtered.length === 0){
      setShowDropdown(false);
    }
    setFilteredOptions(filtered);
    if(id === "skills"){
      setSelectedSkill(searchText);
    }
    if(id === "tags"){
      setSelectedTags(searchText);
    }
    
  };

  //add selected skills or tag to their respective array
  const handleSelectOption = (selectedOption) => {
    setFilterText(selectedOption); // Set selected option as filter text
    setShowDropdown(false); // Hide dropdown after selection
    if(id === "skills"){
      setSelectedSkill(selectedOption);
    }else if(id === "tags"){
      setSelectedTags(selectedOption);
    }

    if (inputRef.current) {
      inputRef.current.value = selectedOption; // Set input value directly using ref
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && filteredOptions.length === 1) {
      setFilterText(filteredOptions[0]); // Set the first filtered option as filter text when Enter is pressed
      setShowDropdown(false); // Hide dropdown after pressing Enter
    }
  };

  //when x is clicked, the skill is removed
  const handleDeleteSkill = (index) => {
    // Create a copy of the skills array
    const updatedSkills = [...skills];
    // Remove the skill at the specified index
    updatedSkills.splice(index, 1);
    // Update the state with the new skills array
    setSkills(updatedSkills);
    setPossibleErrors(prevState => ({
      ...prevState,
      maxAdditions: false
    }));
  };

  return(
    <>
    <div className="container_two">
      {/* error messaging */}
      {possibleErrors.maxAdditions ? (
      <div> 
        <h2> You have reached your limit. Please remove an attribute before 
        adding another. </h2>
      </div>):(<div style={{ display: 'none' }}></div>)}

      {possibleErrors.incompleteCompletion ? (
        <div>
          <h2> You have not added a skill or a skill level, please complete the input. </h2>
        </div>
      ):( <div style={{ display: 'none' }}></div> )}
      <div className="dropdown-container">
        <div className="alignGrouping">
          <input
            type="text"
            value={filterText}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)} // Show dropdown when input is focused
            placeholder="Add relevent skills"
            className="dropdownBox"
            onKeyDown={handleKeyPress}
          />
          {showDropdown && (
            <div className="dropdownBox"> 
            <select className="dropdown" size={filteredOptions.length} 
            onChange={(e) => handleSelectOption(e.target.value)}>
              {filteredOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          )}
        </div>

        {/* since the smae component is used for tags & skills, 
        but tags dont have a levels aspect so hide that piece  */}
        {hideLevel ? (
          <div></div>
        ):(
          <select id="levelDropdown"
            className="dropdown2"
            value={selectedSkillLevel}
            onChange={(e) => setSelectedSkillLevel(e.target.value)}>
            <option value="" disabled selected>Skill level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Experienced">Experienced</option>
            <option value="Advanced">Advanced</option>
          </select>
        )}
        <button className="action-button" onClick={handleActionButtonClick}>Add</button>
      </div>
    </div>

    {hideLevel ? (
      <div></div>
    ) : (
      (skills.length > 0 && (
        <div className="table-style">
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Skill Level</th>
              </tr>
            </thead>
            <tbody>
              {/* TODO: RESTRICT TO 5 not only just showing 5 but can only upload 5 */}
              {/* Maps skills content within table to 5 items. */}
              {skills.slice(0, 5).map((skill, index) => (
                <tr key={index}>
                  <td>{skill.skill}</td>
                  <td>{skill.skillLevel} <div className="deleteButton"> 
                    <button onClick={() => handleDeleteSkill(index)}
                      style={{
                        color: '#B91C1C',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    > X </button></div> </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      ))
    )}
    <div>
      {/* displaying tags */}
      {Array.isArray(typedTag) && typedTag.map((tag, index) => (
        <div key={index} className="tag">
          {tag}
         <span style={{marginRight: '5px' }}>{tag}</span>
         <span onClick={() => handleRemoveTag(index)} style={{ color: 'red', cursor: 'pointer' }}>X</span>

        </div>
      ))}
    </div>
    </>
  );
};