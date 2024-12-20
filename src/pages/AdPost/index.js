import "./index.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronDown, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import uploadIcon from "../../assets/icon.svg";
import { db, doc, addDoc, updateDoc, collection, storage, ref, uploadBytes, getDownloadURL, deleteObject } from "../../config/firebase";
import Swal from "sweetalert2";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const AdPost = ({ loginUser }) => {
    const navigate = useNavigate();
    const [postTitle, setPostTitle] = useState(null);
    const [postDescription, setPostDescription] = useState(null);
    const [postBrand, setPostBrand] = useState(null);
    const [postPrice, setPostPrice] = useState(null);
    const [postImages, setPostImages] = useState([]);  // Old images from database
    const [newImages, setNewImages] = useState([]);    // New images uploaded by user
    const [postLocation, setPostLocation] = useState("");
    const [postUserName, setPostUserName] = useState("");
    const [postUserNumber, setPostUserNumber] = useState("");
    const [isLocationList, setIsLocationList] = useState(false);
    const [imageCount, setImageCount] = useState(0);   // Total count of images (old + new)
    const [isEditing, setIsEditing] = useState(false);  // State to track if in edit mode
    const [postId, setPostId] = useState(null);         // State to store post ID
    const [isPosting, setIsPosting] = useState(false);

    // Fetch post data from localStorage and populate form fields for editing
    useEffect(() => {
        const productData = JSON.parse(localStorage.getItem("postData"));

        if (productData) {
            setPostTitle(productData.postTitle);
            setPostDescription(productData.postDescription);
            setPostBrand(productData.postBrand);
            setPostPrice(productData.postPrice);
            setPostLocation(productData.postLocation);
            setPostUserName(productData.postUserName);
            setPostUserNumber(productData.postUserNumber);
            setPostId(productData.id);  // Save the ID of the post for editing
            setPostImages(productData.postImages);  // Load old images
            setImageCount(productData.postImages.length);  // Set initial image count
            setIsEditing(true);         // Enable edit mode
        }

        return () => {
            localStorage.removeItem("postData");
        }
    }, [])

    useEffect(() => {
        const productData = JSON.parse(localStorage.getItem("postData"));

        if (productData) {
            setPostTitle(productData.postTitle);
            setPostDescription(productData.postDescription);
            setPostBrand(productData.postBrand);
            setPostPrice(productData.postPrice);
            setPostLocation(productData.postLocation);
            setPostUserName(productData.postUserName);
            setPostUserNumber(productData.postUserNumber);
            setPostId(productData.id);  // Save the ID of the post for editing
            setPostImages(productData.postImages);  // Load old images

            // Update image count based on whether postImages is an array or string
            const initialImageCount = Array.isArray(productData.postImages)
                ? productData.postImages.length
                : productData.postImages ? 1 : 0;

            setImageCount(initialImageCount);  // Set initial image count
            setIsEditing(true);         // Enable edit mode
        }

        return () => {
            localStorage.removeItem("postData");
        };
    }, []);

    // Show and hide location list dropdown
    function showAndHideLocationList() {
        setIsLocationList(!isLocationList);
    }

    // Set location from the dropdown
    function selectLocation(location) {
        setPostLocation(location);
        setIsLocationList(!isLocationList);
    }

    // Handle new image uploads
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // Save new images for uploading to Firebase later
        setNewImages((prevNewImages) => [...prevNewImages, ...files]);

        setImageCount((prevCount) => prevCount + files.length);  // Update image count
    };

    // Handle image deletion from old images
    const handleDeleteImage = async (imageUrl, index) => {
        try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);  // Delete image from Firebase Storage

            // Ensure that prevImages is an array
            setPostImages((prevImages) => {
                const imagesArray = Array.isArray(prevImages) ? prevImages : [];

                // Remove image from old images
                const updatedImages = imagesArray.filter((_, i) => i !== index);

                // If no images are left, set postImages to null or an empty array
                const imagesToSave = updatedImages.length === 0 ? [] : updatedImages;

                // Update Firestore with the new image data (either empty array or remaining images)
                if (isEditing && postId) {
                    const postRef = doc(db, "post", postId);
                    updateDoc(postRef, { postImages: imagesToSave });
                }

                // Update the state and image count
                setImageCount(updatedImages.length + newImages.length);  // Adjust count
                return updatedImages;
            });

            // Swal.fire("Success", "Image deleted successfully!", "success");
            // Show success toast instead of SweetAlert
            toast.success("Image deleted successfully!");
        } catch (error) {
            // Swal.fire("Error", "Failed to delete image.", "error");
            // Show error toast instead of SweetAlert
            toast.error("Failed to delete image.");
        }
    };


    // Submit post (edit or create)
    async function postAd() {

        setIsPosting(true);
        const fields = [
            { value: postTitle, message: "Please enter a title for the post" },
            { value: postDescription, message: "Please enter a description" },
            { value: postBrand, message: "Please enter a brand name" },
            { value: postPrice, message: "Please enter the price" },
            { value: postLocation, message: "Please select a location" },
            { value: postUserName, message: "Please enter your name" },
            { value: postUserNumber, message: "Please enter your contact number" },
            { value: imageCount > 0, message: "Please upload at least one image" }
        ];

        // Validate each field
        for (let field of fields) {
            if (!field.value) {
                Swal.fire(field.message);
                return;
            }
        }

        try {

            const imageUrls = Array.isArray(postImages) ? [...postImages] : [postImages];  //Keep old images, Ensure postImages is always an array

            // Upload new images to Firebase Storage
            for (let imageFile of newImages) {
                const imageRef = ref(storage, `post_images/${imageFile.name}`);
                const snapshot = await uploadBytes(imageRef, imageFile);
                const downloadURL = await getDownloadURL(snapshot.ref);
                imageUrls.push(downloadURL);  // Add new image URLs to the array
            }

            const imagesToSave = imageUrls.length === 1 ? imageUrls[0] : imageUrls;  // Save single or multiple images

            // If in edit mode, update the existing post with old and new images
            if (isEditing && postId) {
                const postRef = doc(db, "post", postId);  // Reference the existing post by its ID
                await updateDoc(postRef, {
                    postTitle,
                    postDescription,
                    postBrand,
                    postPrice,
                    postImages: imagesToSave,  // Save both old and new images
                    postLocation,
                    postUserName,
                    postUserNumber
                });

                Swal.fire("Success", "Post updated successfully!", "success").then(() => {
                    navigate(-1);
                });
            } else {
                // Create a new post
                const docRef = await addDoc(collection(db, "post"), {
                    postTitle,
                    user_id: loginUser,
                    postDescription,
                    postBrand,
                    postPrice,
                    postImages: imagesToSave,
                    postLocation,
                    postUserName,
                    postUserNumber
                });

                await updateDoc(docRef, { id: docRef.id });  // Update with the generated ID
                Swal.fire("Success", "Post created successfully!", "success").then(() => {
                    navigate("/");
                });
            }
        } catch (e) {
            console.error("Error adding or updating document: ", e);
            Swal.fire("Error", "Failed to update the post.", "error");
        }
    }

    // Remove new image from UI and state
    const handleRemoveNewImage = (index) => {
        const imageUrls = Array.isArray(postImages) ? [...postImages] : [postImages];
        setNewImages((prevImages) => {
            const updatedImages = prevImages.filter((_, i) => i !== index);
            setImageCount(updatedImages.length + imageUrls.length);  // Update image count
            return updatedImages;
        });
    };

    // Handle phone number input
    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;
        // Allow only numbers
        if (/^\d*$/.test(value)) {
            setPostUserNumber(value);
        }
    };

    // Format number with commas
    const formatPriceWithCommas = (value) => {
        return new Intl.NumberFormat().format(value);
    };

    // Handle price input
    const handlePriceChange = (e) => {
        const value = e.target.value.replace(/,/g, ''); // Remove commas for proper parsing
        // Allow only numbers
        if (/^\d*$/.test(value)) {
            // If input is empty, set price to an empty string
            if (value === "") {
                setPostPrice("");
            } else {
                setPostPrice(formatPriceWithCommas(value));
            }
        }
    };

    return (
        <div className="AdPost">
            <ToastContainer />
            <div className="navbar">
                <FontAwesomeIcon className="i" icon={faArrowLeft} onClick={() => navigate('/')}></FontAwesomeIcon>
                <img src={require("../../assets/olx_logo.png")} alt="" />
            </div>

            <div className="heading">
                <h3>{isEditing ? "EDIT YOUR AD" : "POST YOUR AD"}</h3>
            </div>

            <div className="adpost-container">
                <div className="modal" style={isPosting ? { display: "flex" } : { display: "none" }}>
                    <div className="modal-content">
                        <div className="loading">
                            <h2>Posting ad, please wait</h2>
                            <span><i></i><i></i></span>
                        </div>
                    </div>
                </div>

                <div className="add-form">
                    {/* Include Details Section */}
                    <div className="include-details">
                        <h3>INCLUDE SOME DETAILS</h3>
                        <p>Add title</p>
                        <div className="input-box">
                            <input
                                className="detail-box"
                                type="text"
                                onChange={(e) => setPostTitle(e.target.value)}
                                value={postTitle || ''}
                            />
                        </div>
                        <div className="message">
                            <p>Mention the key features of your item (e.g. brand, model, age, type)</p>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="description">
                        <p>Description</p>
                        <div className="description-box">
                            <textarea
                                className="description-input"
                                cols="30"
                                rows="10"
                                onChange={(e) => setPostDescription(e.target.value)}
                                value={postDescription || ''}
                            ></textarea>
                        </div>
                        <div className="message2">
                            <span>Include condition, features and reason for selling</span>
                        </div>
                        <div className="brand">
                            <p>Brand</p>
                            <div className="brand-box">
                                <input
                                    className="brand-input"
                                    type="text"
                                    placeholder="Enter Brand"
                                    onChange={(e) => setPostBrand(e.target.value)}
                                    value={postBrand || ''}
                                />
                            </div>
                        </div>
                    </div>

                    <hr />

                    {/* Set Price Section */}
                    <div className="set-price-box">
                        <h3>SET A PRICE</h3>
                        <p>Price</p>
                        <div className="set-price">
                            <input
                                className="set-price-input"
                                type="text"
                                placeholder="Rs |"
                                onChange={handlePriceChange}
                                value={postPrice || ''}
                            />
                        </div>
                    </div>

                    <hr />

                    {/* Upload Photos Section */}
                    <div className="upload-photos">
                        <h3>UPLOAD UP TO 20 PHOTOS</h3>
                        <div className="photo-row1">
                            <label htmlFor="photo_1" className="photo">
                                <img src={uploadIcon} alt="Upload Icon" />
                                <input
                                    type="file"
                                    className="form-control"
                                    style={{ opacity: 0, position: "absolute", width: "90px", height: "90px" }}
                                    multiple
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                />
                            </label>
                            <div className="uploaded-images">
                                {/* Display Old Images */}
                                {/* Check if postImages is an array, if not, convert it to an array */}
                                {Array.isArray(postImages)
                                    ? postImages.map((image, index) => (
                                        <div key={index} className="image-container">
                                            <img src={image} alt={`Uploaded ${index}`} />
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                className="delete-icon"
                                                onClick={() => handleDeleteImage(image, index)}
                                            />
                                        </div>
                                    ))
                                    : (
                                        <div className="image-container">
                                            {/* Display single image if it's a string */}
                                            <img src={postImages} alt="Uploaded" />
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                className="delete-icon"
                                                onClick={() => handleDeleteImage(postImages, 0)}
                                            />
                                        </div>
                                    )
                                }

                                {/* Display New Images (can't be deleted yet) */}
                                {newImages.map((imageFile, index) => (
                                    <div key={index} className="image-container">
                                        <img
                                            src={URL.createObjectURL(imageFile)}  // Preview new image
                                            alt="new upload"
                                        />
                                        <FontAwesomeIcon icon={faXmark} onClick={() => handleRemoveNewImage(index)} className="x-icon" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {imageCount > 0 ? (
                            <p style={{ fontSize: "16px", fontWeight: "bold", color: "rgb(86, 189, 200)" }}>
                                {imageCount} {imageCount > 1 ? "Images" : "Image"} selected
                            </p>
                        ) : (
                            <p>For the cover picture, we recommend using the landscape mode.</p>
                        )}
                    </div>

                    <hr />

                    {/* Ads Location Section */}
                    <div className="ads-location">
                        <h3>YOUR AD'S LOCATION</h3>
                        <p>Location</p>
                        <div className="ads-location-box">
                            <div onClick={showAndHideLocationList} className="ads-location-input">
                                {postLocation ? (
                                    postLocation
                                ) : (
                                    <div className="location-input">
                                        <div className="icon">
                                            <FontAwesomeIcon className={isLocationList ? "icon move" : "icon"} icon={faChevronDown}></FontAwesomeIcon>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="ads-location-parent">
                            <div className={isLocationList ? "ads-location-dropdown hidden" : "ads-location-dropdown"}>
                                <ul>
                                    <ol className="bold">Choose Region</ol>
                                    <li onClick={() => selectLocation('Peshawar, Pakistan')}>Peshawar, Pakistan</li>
                                    <li onClick={() => selectLocation('Quetta, Pakistan')}>Quetta, Pakistan</li>
                                    <li onClick={() => selectLocation('Multan, Pakistan')}>Multan, Pakistan</li>
                                    <li onClick={() => selectLocation('Islamabad, Pakistan')}>Islamabad, Pakistan</li>
                                    <li onClick={() => selectLocation('Lahore, Pakistan')}>Lahore, Pakistan</li>
                                    <li onClick={() => selectLocation('Hyderabad, Pakistan')}>Hyderabad, Pakistan</li>
                                    <li onClick={() => selectLocation('Karachi, Pakistan')}>Karachi, Pakistan</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <hr />

                    {/* Review Your Details Section */}
                    <div className="review-details">
                        <h3>REVIEW YOUR DETAILS</h3>
                        <div className="user-img-box">
                            <img src={require("../../assets/pic3.png")} alt="User" />
                            <div className="name-box">
                                <p>Name</p>
                                <input
                                    className="user-name"
                                    type="text"
                                    placeholder="OLX User"
                                    onChange={(e) => setPostUserName(e.target.value)}
                                    value={postUserName || ''}
                                />
                            </div>
                        </div>
                        <div className="verify-div">
                            <h3>Let's verify your account</h3>
                            <p>Mobile Phone Number</p>
                            <div className="verify-box">
                                <input
                                    className="verify-input"
                                    type="text"
                                    placeholder="+92 | Phone number"
                                    maxLength={11} // restrict to 11 digits for Pakistan phone numbers
                                    onChange={handlePhoneNumberChange}
                                    value={postUserNumber || ''}
                                />
                            </div>
                        </div>
                    </div>

                    <hr />

                    {/* Final Submit Button */}
                    <div className="last-button">
                        <button className="btn" type="button" onClick={postAd}>
                            {isEditing ? "Update Post" : "Post Now"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default AdPost;




