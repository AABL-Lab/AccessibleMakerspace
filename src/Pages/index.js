import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from "react-router-dom";
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
                <h1>Welcome to the BETA page for the A2 Makerspace!</h1> 
                <br/>
                <p>{indexText}</p>
                <div className="visitor-guidance">
                  <h2>First time here?</h2>
                  <p>Choose a path below to get started.</p>
                  <div className="visitor-guidance-grid">
                    <Link className="visitor-guidance-card" to="/projects">
                      <h3>Looking for inspiration?</h3>
                      <p>Browse maker projects, filter by tags, and see what others have built.</p>
                    </Link>
                    <Link className="visitor-guidance-card" to="/makers">
                      <h3>Are you a teacher or mentor?</h3>
                      <p>Meet makers and find examples you can bring into a classroom, workshop, or event.</p>
                    </Link>
                    <Link className="visitor-guidance-card" to="/signUp">
                      <h3>Ready to share a project?</h3>
                      <p>Create an account and upload your own design, supplies, photos, and videos.</p>
                    </Link>
                    <Link className="visitor-guidance-card" to="/about">
                      <h3>Want to learn more?</h3>
                      <p>Read about the purpose of the A2 Makerspace and how this community works.</p>
                    </Link>
                  </div>
                </div>
              </div>
              <div>
                <img src="images/gocart.png" alt="Greyscale sketch of a woman with curly hair in double buns, large sunglasses, and a Hawaiian-printed matched open shirt, crop-top, and skirt outfit drives a 4-wheeled buggy with visible joins and tubing, with large puffy tires,  on the sand. A large striped umbrella mounted on the buggy shades her from the sun. " width="800"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}