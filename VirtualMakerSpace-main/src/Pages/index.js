import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import index from "./Text/index.txt"

export default function Home(){

//defining variable to store the text imported from the file 
const [indexText, setText] = useState (''); 

  // UseEffect function grabs the paragraph text on the page from the text folder on page load  
  useEffect (() => {
    fetch (index)
    .then (r => r.text ())
    .then (indexText => { 
      setText (indexText);
    }); 
  }, []); 
    
  return(
    <div>
      <div>
        <div class="landing-wrapper">
          <div class="landing-page-container">
            <div class="landing-page-content">
              <div class="landing-page-text">
                <h1>Welcome to the A2 Makerspace!</h1> 
                <br/>
                <p>{indexText}</p>
                <div class="about-button-container">
                  <button class="about-button" onclick="aboutLink()">Learn More</button>
                </div>
              </div>
              <div>
                <img src="images/cover-image.svg" alt="People Building" width="800"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}