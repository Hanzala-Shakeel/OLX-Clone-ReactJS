import "./index.css";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { auth, createUserWithEmailAndPassword, db, addDoc, collection } from "../../config/firebase";
import { useState } from "react";
import Swal from "sweetalert2";

function SignUp() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const validateEmail = (email) => {
        // Regular expression for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const signupUser = async () => {
        try {
            if (!name) {
                Swal.fire("Please enter your name");
                return;
            }

            if (!email) {
                Swal.fire("Please enter your email");
                return;
            }

            if (!validateEmail(email)) {
                Swal.fire("Invalid Email", "Please enter a valid email address", "warning");
                return;
            }

            if (!password) {
                Swal.fire("Please enter your password");
                return;
            }

            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save additional user data to Firestore
            await addDoc(collection(db, "users"), {
                name: name,
                email: email,
                user_id: user.uid,
            });

            // Clear form fields
            setName('');
            setEmail('');
            setPassword('');

            // Success message
            Swal.fire("Success", "Signup successful!", "success").then(() => {
                // Redirect logic can go here
                console.log('Signup successful for:', user.email);
                navigate("/");
            });

        } catch (error) {
            // Handle errors
            if (error.code === "auth/email-already-in-use") {
                Swal.fire("Email Already in Use", "Please use a different email address", "warning");
            }
            else {
                Swal.fire("Error", error.message, "error");
            }
            // console.error(error.code, error.message);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <div className="signup-box-img">
                    <img src={require("../../assets/olx_logo.png")} alt="OLX Logo" />
                </div>
                <div className="signup-h3">
                    <h3>Registration Page</h3>
                </div>
                <div className="signup-email">
                    <input
                        className="input"
                        type="text"
                        placeholder="Name"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                    />
                </div>
                <div className="signup-email">
                    <input
                        className="input"
                        type="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                    />
                </div>
                <div className="signup-password">
                    <input
                        className="input"
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                    />
                </div>
                <div className="signup-button">
                    <button className="signup-btn" type="button" onClick={signupUser}>
                        Sign Up
                    </button>
                </div>
                <div className="forget-passowrd">
                    <p>Already have an account? <Link to="/login">LOGIN</Link></p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
