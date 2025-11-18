import React, { useState, useEffect } from "react";
import aboutCEEO from "./Text/aboutCEEO.txt";
import aboutAABL from "./Text/aboutAABL.txt";
import missionStatement from "./Text/missionStatement.txt";

// Export the function component named About.
// Function names must be capital letters because of the React hook rules,
// like using useState requires function names to be capital as convention.
export default function About() {
  // Declare a state variable called text and a function to update it using useState hook.
  const [text, setText] = useState('');
  const [text2, setText2] = useState('');
  const [missiontext, setSecondText] = useState('');

  // Use fetch method to get data from the aboutUs file.
useEffect(() => {
  const loadTexts = async () => {
    try {
      const [aabl, ceeo, mission] = await Promise.all([
        fetch(aboutAABL).then(r => r.text()),
        fetch(aboutCEEO).then(r => r.text()),
        fetch(missionStatement).then(r => r.text())
      ]);
      
      setText(aabl);
      setText2(ceeo);
      setSecondText(mission);
    } catch (error) {
      console.error('Error loading text files:', error);
    }
  };
  
  loadTexts();
}, []);

  return (
    <div id="about-columns">
      <div>
        <div id="aboutAABL">
          <h1>About Us</h1>
          <p>{text}</p>
          {/* both buttons are connected to their relevant outside website*/}
          <a href="https://aabl.cs.tufts.edu/" target="_blank" rel="noopener noreferrer"> 
            <button type="button">Learn More: AABL</button>
          </a>
          </div>
          <div id="aboutCEEO">
          <p>{text2}</p>
          <a href="https://www.ceeoinnovations.org/fetlab/" target="_blank" rel="noopener noreferrer">
            <button type="button">Learn More: CEEO</button>
          </a>
        </div>
<div id="missionstatement">
  <h1>Our Mission</h1>
  <div dangerouslySetInnerHTML={{ __html: missiontext }} />
</div>
      </div>
      <div id="aboutImg">
        <img src="images/handwashing.png" alt="A black and white sketch of a woman sitting in a wheelchair with long braided hair. She is washing her hands at a sink, chair sideways to the sink, using a DIY handle adaptor to adjust the faucet handles." />
      </div>
    </div>
  );
}
