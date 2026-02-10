import React from "react";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {

  const handleMailto = (e) => {
    e.preventDefault();

    const form = e.target;
    const subject = form.subject.value;
    const message = form.message.value;

    const bodyText = `Hi there!\n${message}`;

    const mailtoLink = `mailto:a2makerspace@eecs.tufts.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="footer">
      <div className="row">
        <div className="location">
          <h4 className="contact">Contact Us</h4>
          <a 
            href="https://www.google.com/maps/search/?api=1&query=177+College+Ave,+Medford,+MA+02155" 
            target="_blank" 
            rel="noopener noreferrer"
          > 
            <i className="fa fa-map-marker mr-3"></i> 
            177 College Ave, Medford, MA 02155
          </a>
          <p className="mb-0"><i className="fa fa-phone mr-3"></i>(617) 627-6724</p>
          <p> <i className="fa fa-envelope-o mr-3"></i> a2makerspace@eecs.tufts.edu</p>
        </div>
      </div> 

      <div>
        <div id="right-col">
          <form className="form" onSubmit={handleMailto}>
            <h2 style={{textAlign: "center"}}>Get in Touch</h2> 
            
            <label>
              Subject:
              <input type="text" name="subject" placeholder="Subject" required/>
            </label>
            
            <label>
              Message:
              <input type="text" name="message" placeholder="Message" required/>
            </label>

            <input type="submit" value="Send Message" />
          </form>
        </div>
      </div>
    </div>
  );
}

export default Footer;