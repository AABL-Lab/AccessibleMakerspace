import React from "react";
// TODO: import icons 
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';

const footer = () => {
  return (
    <div class="footer">
      <div class="row">
        <div class="location">
          <h4 class="contact">Contact Us</h4>
          <a href="https://shorturl.at/jlz12" target="blank"> 177 College Ave, Medford, MA 02155</a>
          <p class="mb-0"><i class="fa fa-phone mr-3"></i>(617) 627-6724</p>
          <p> <i class="fa fa-envelope-o mr-3"></i> a2makerspace@eecs.tufts.edu</p>
        </div>
      </div> 

      <div>
        <div id="right-col">
          {/* Consider changing email method to not open browser */}
          {/* This link looks promising */}
          {/* https://www.geeksforgeeks.org/how-to-send-an-email-from-javascript/# */}
          {/* https://mailtrap.io/blog/javascript-send-email/ */}
          {/* React Mail */}
          <form className="form" action="mailto:a2makerspace@eecs.tufts.edu" method="get" enctype="text/plain">
            <h2 style={{textAlign: "center"}}>Get in Touch</h2> 
            <label>
              Subject:
              <input type="text" subject="subject" placeholder="Subject" required/>
            </label>

            <label>
              Email:
              <input type="text" email="email" placeholder="Email" required/>
            </label>
            
            <label>
              Message:
              <input type="text" message="message" placeholder="Message" required/>
            </label>

            <input type="submit" value="Send Message" />
          </form>
        </div>
      </div>
    </div>
  );
}

export default footer;