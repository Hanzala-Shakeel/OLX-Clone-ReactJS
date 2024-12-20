import "./index.css"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faMagnifyingGlass, faPlus, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import myAdImg from "../../assets/myAdIcon.svg";
import { auth, signOut } from '../../config/firebase'; // Import your Firebase auth configuration
import Swal from "sweetalert2";


function Header({ selectedLocation, setSelectedLocation, productTitles, setFilteredProducts, loginUser, setloginUser, setShowMyAds }) {
    const navigate = useNavigate();
    const [isLocationList, setIsLocationList] = useState(false);
    const [isHamb, setIsHamb] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    function showAndHideLocationList() {
        setIsLocationList(!isLocationList);
    }

    function selectLocation(location) {
        setSelectedLocation(location);
        setSearchInput(""); // Clear search input
        setFilteredProducts(null); // Reset filtered products
        setShowMyAds(false);
        setSuggestions([]);
    }

    function showAndHideMenuOnSmallDevices() {
        setIsHamb(!isHamb)
    }

    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);

        if (productTitles && value) {
            const filteredSuggestions = productTitles
                .filter(({ postTitle, postLocation }) =>
                    (selectedLocation === "" || postLocation === selectedLocation) &&
                    postTitle.toLowerCase().includes(value.toLowerCase())
                )
                .slice(0, 3); // Show a maximum of 3 suggestions
            const uniqueSuggestions = [...new Set(filteredSuggestions.map(item => item.postTitle))];
            setSuggestions(uniqueSuggestions.length > 0 ? uniqueSuggestions : ["No ads found"]);
        } else {
            setSuggestions([]);
        }
        // Close the location list if typing
        if (isLocationList === true) {
            setIsLocationList(false);
        }
    };


    const handleSuggestionClick = (suggestion) => {
        setFilteredProducts(null); // Reset filtered products
        setShowMyAds(false);
        setIsLocationList(false); // Close the location list
        if (suggestion === "No ads found") return; // Do nothing if "No ads found" is clicked
        setSearchInput(suggestion);
        setSuggestions([]);
        setFilteredProducts(suggestion); // Filter products based on the selected suggestion
    };

    const handleAuthAction = () => {
        if (loginUser) {
            // Log out the user
            signOut(auth)
                .then(() => {
                    setloginUser(null)
                    Swal.fire("Success", "LogOut successful!", "success")
                    console.log("User signed out successfully");
                    //   navigate('/login'); // Redirect to login page after logout
                })
                .catch((error) => {
                    console.error("Error signing out: ", error);
                });
        } else {
            // Navigate to login page
            navigate('/login');
        }
    };

    function clearFilters() {
        setSelectedLocation("");
        setFilteredProducts(null); // Reset filtered products
        setSearchInput(""); // Clear search input
        setIsLocationList(false); // Close the location list
        setSuggestions([]); // Clear suggestions
    }

    // Function to show only the current user's ads
    const handleShowMyAds = () => {
        setShowMyAds(true); // Activate "My Ads" filtering
        clearFilters(); // Call the helper function
    };

    const resetHome = () => {
        setShowMyAds(false); // Deactivate "My Ads" filtering
        clearFilters(); // Call the helper function
    };

    return (
        <div className="header">
            <div className="img-container" onClick={resetHome}>
                <img
                    src={require('../../assets/olx_logo.png')}
                    alt=""
                    style={{ cursor: 'pointer' }}
                />
                <img
                    className="hamb"
                    src={require(isHamb ? "../../assets/close.png" : "../../assets/hamb.png")}
                    alt=""
                    onClick={showAndHideMenuOnSmallDevices}
                />
            </div>
            <div onClick={showAndHideLocationList} className="location-box">
                <div className="select-location">
                    {selectedLocation === "" ? <p>Select Your Location</p> : <p>{selectedLocation}</p>}
                    <FontAwesomeIcon icon={faChevronDown} className={isLocationList ? "rotate blue" : "blue"} />
                </div>
                {
                    isLocationList ? <ul className="option-box">
                        <li className="option" onClick={() => selectLocation('')}>
                            <FontAwesomeIcon icon={faLocationDot} className="blue" />
                            <p className="blue">See ads in all Pakistan</p>
                        </li>
                        <hr />
                        <li className="option" onClick={() => selectLocation('Peshawar, Pakistan')}>
                            <FontAwesomeIcon icon={faLocationDot} />
                            <p>Peshawar, Pakistan</p>
                        </li>
                        <li className="option" onClick={() => selectLocation('Quetta, Pakistan')}>
                            <FontAwesomeIcon icon={faLocationDot} />
                            <p>Quetta, Pakistan</p>
                        </li>
                        <li className="option" onClick={() => selectLocation('Multan, Pakistan')}>
                            <FontAwesomeIcon icon={faLocationDot} />
                            <p>Multan, Pakistan</p>
                        </li>
                        <li className="option" onClick={() => selectLocation('Islamabad, Pakistan')}>
                            <FontAwesomeIcon icon={faLocationDot} />
                            <p>Islamabad, Pakistan</p>
                        </li>
                        <li className="option" onClick={() => selectLocation('Lahore, Pakistan')}>
                            <FontAwesomeIcon icon={faLocationDot} />
                            <p>Lahore, Pakistan</p>
                        </li>
                        <li className="option" onClick={() => selectLocation('Hyderabad, Pakistan')}>
                            <FontAwesomeIcon icon={faLocationDot} />
                            <p>Hyderabad, Pakistan</p>
                        </li>
                        <li className="option" onClick={() => selectLocation('Karachi, Pakistan')}>
                            <FontAwesomeIcon icon={faLocationDot} />
                            <p>Karachi, Pakistan</p>
                        </li>
                    </ul> : null
                }
            </div>
            <div className="search-container">
                <div className="search-box">
                    <input
                        type="text"
                        className="search"
                        placeholder="Find Cars, Mobile Phones and more..."
                        value={searchInput}
                        onChange={handleSearchInputChange}
                    />
                    <FontAwesomeIcon className="i" icon={faMagnifyingGlass} />
                </div>
                {suggestions.length > 0 && (
                    <div className="search-div">
                        <ul>
                            {suggestions.map((suggestion, index) => (
                                <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className={isHamb ? "container active" : "container"}>
                <div className={loginUser ? "myAdDiv" : "hideMyAdDiv"} onClick={handleShowMyAds}>
                    <img className="myAdImg" src={myAdImg} alt="" />
                    <p>My Ads</p>
                </div>
                <div className="login-button" onClick={handleAuthAction}><p className="loginText">{loginUser ? "LogOut" : "Login"}</p></div>
                <p className="sell_button">
                    <button className="sellWrapper" onClick={loginUser ? () => navigate('/adpost') :() => navigate('/login')}>
                        <FontAwesomeIcon className="i" icon={faPlus} />
                        <p>SELL</p>
                    </button>
                </p>
            </div>
        </div>
    );
}



export default Header;
