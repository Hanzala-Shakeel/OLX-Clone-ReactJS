import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { auth, onAuthStateChanged } from "../src/config/firebase";
import { useState, useEffect } from "react";
import Home from "../src/pages/Home";
import AdPage from "../src/pages/AdPage";
import SignUp from "../src/pages/SignUp";
import Login from "../src/pages/Login"
import AdPost from "../src/pages/AdPost";


function App() {
  const [loginUser, setLoginUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const uid = user.uid;
        setLoginUser(uid);
        console.log(uid);
      } else {
        // User is signed out
        setLoginUser(null); // Optional: You may want to set loginUser to null explicitly on sign-out
        console.log("no user");
      }
    });

    // Clean up subscription to avoid memory leaks
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home loginUser={loginUser} setloginUser={setLoginUser} />} />
        <Route path="/adpage/:productId" element={<AdPage loginUser={loginUser}/>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/adpost" element={<AdPost loginUser={loginUser} />} />
      </Routes>
    </Router>
  )
}


export default App;
