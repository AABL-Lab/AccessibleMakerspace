import './App.css';
import './Styling/navBar.css';
import './Styling/header.css';
import './Styling/footer.css';
import './Styling/about.css';
import './Styling/login.css';
import './Styling/projCard.css';
import './Styling/singleProj.css';
import './Styling/projectUpload.css';
import './Styling/userPage.css';
import Footer from "./Components/footer";
import React, { useState } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route
} from "react-router-dom";
import Home from "./Pages";
import Navbar from "./Components/navBar.js";
import About from "./Pages/about";
import Header from "./Components/header";
import Login from "./Pages/login";
import SignUp from "./Pages/signUp";
import Makers from './Pages/makers.js';
import Projects from "./Pages/projects";
import SingleProj from './Pages/singleProj.js';
import ProjectUpload from "./Pages/projectUpload.js";
import UserPage from "./Pages/userPage.js";


function App() {
	console.log("App being Run");
	const [showNav, setShowNav] = useState(true);

	//TODO: ADD more Protected Route for upload projects : https://www.freecodecamp.org/news/react-router-tutorial/ 
	return (
		<>
		<Router>
			<Header/>
			{ showNav && <Navbar /> } 
			<Routes>
				<Route exact path="/" element={<Home />} />
				<Route path="/about" element={<About />} />
				<Route path="/projects" element={<Projects />} />
				{/* TODO: customize path with proj title based on clicked project */}
				<Route path="/project" element={<SingleProj />}/>
				<Route path="/projectUpload" element={<ProjectUpload />} />
				<Route path="/makers" element={<Makers />}/>
				<Route path="/userPage" element={<UserPage />} />
				{/* boolean setShowNav hides the navBar on login & signUp pages */}
				<Route path="/login" element={<Login funcNav={setShowNav}/>}/>
				<Route path="/signUp" element={<SignUp funcNav={setShowNav}/>}/>
			</Routes>
		</Router>
		{ showNav && <Footer/> }
		</>
	);
}

export default App;
