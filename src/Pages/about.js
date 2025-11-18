import React, { useState, useEffect } from "react";
import aboutUs from "./Text/aboutUs.txt";
import missionStatement from "./Text/missionStatement.txt";

// Export the function component named About.
// Function names must be capital letters because of the React hook rules,
// like using useState requires function names to be capital as convention.
export default function About() {
  // Declare a state variable called text and a function to update it using useState hook.
  const [text, setText] = useState('');
  const [missiontext, setSecondText] = useState('');

  // Use fetch method to get data from the aboutUs file.
  useEffect(() => {
    fetch(aboutUs)
      // Use then method to handle the resolved promise and get the response object
      .then(r => r.text())
      // Use then method to handle the resolved promise and get the text content.
      .then(text => {
        // Use setText function to update the text state variable with the text content.
        setText(text);
      });
    // Use empty array as the second argument to useEffect to run the effect only once.
  }, []);

  useEffect(() => {
    fetch(missionStatement)
      .then(r => r.text())
      .then(missiontext => {
        setSecondText(missiontext);
      });
  }, []);

  return (
    <div id="about-columns">
      <div>
        <div id="about">
          <h1>About Us</h1>
          <p>{text}</p>
          {/* both buttons are connected to their realevant outside website*/}
          <a href="https://aabl.cs.tufts.edu/" target="_blank"> 
            <button type="button">Learn More: AABL</button>
          </a>
          <a href="https://www.ceeoinnovations.org/fetlab/" target="_blank">
            <button type="button">Learn More: CEEO</button>
          </a>
        </div>
        <div id="about2">
          <h1>Our Mission</h1>
          <p>{missiontext}</p>
        </div>
      </div>
      <div id="aboutImg">
        <img src="images/handwashing.png" alt="A black and white sketch of a woman sitting in a wheelchair with long braided hair. She is washing her hands at a sink, chair sideways to the sink, using a DIY handle adaptor to adjust the faucet handles." />
      </div>
    </div>
  );
}
