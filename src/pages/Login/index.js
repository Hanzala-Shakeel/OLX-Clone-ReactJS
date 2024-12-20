import "./index.css"
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword } from "../../config/firebase";
import { useState } from "react";
import Swal from "sweetalert2";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const validateEmail = (email) => {
        // Regular expression for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const loginUser = async () => {
        try {
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Clear form fields
            setEmail('');
            setPassword('');

            // Success message
            Swal.fire("Success", "Login successful!", "success").then(() => {
                // Redirect logic can go here
                console.log('Login successful for:', user.email);
                navigate("/");
            });

        } catch (error) {
            // Handle errors
            if (error.code === "auth/user-not-found") {
                Swal.fire("Account Not Found!", "Please register to create an account", "warning");
            }
            else if (error.code === "auth/wrong-password") {
                Swal.fire("Incorrect Password!", "Please check your password and try again", "error");
            }
            else {
                Swal.fire("Error", error.message, "error");
            }
            // console.error(error.code, error.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-box-img">
                    <img src={require("../../assets/olx_logo.png")} alt="" />
                </div>
                <div className="login-h3">
                    <h3>Enter your Email and Password</h3>
                </div>
                <div className="login-email">
                    <input
                        className="input"
                        type="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                    />
                </div>
                <div className="login-password">
                    <input
                        className="input"
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                    />
                </div>
                <div className="forget-passowrd">
                    <p>Don't have an account ? <Link to="/signup">SIGNUP</Link></p>
                </div>
                <div className="login-button-container">
                    <button className="login-btn" type="button" onClick={loginUser}>
                        Log in
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login;