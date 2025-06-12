import React from "react";
import {Link} from 'react-router-dom';

const navBar = () => {
  return (
    <nav id ="navbar">
      {/* <img src="images/exaLog.png" className="logo"> */}
      <ul>
        <li>
          <Link to="/projects">Projects</Link>
        </li>
        {/* <li>
          <Link to="/tutorials">Tutorials</Link>
        </li> */}
        <li>
          <Link to="/makers">Makers</Link>
        </li>
        <li>
          <Link to="/about">About Us</Link>
        </li>
      </ul>
    </nav>
  );
};

export default navBar;