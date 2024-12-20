import "./index.css"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { db, doc, getDoc, deleteDoc, deleteObject, storage, ref } from "../../config/firebase";
import Skeleton from '@mui/material/Skeleton';
import { Carousel } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

function AdPage({ loginUser }) {
  const { productId } = useParams();
  const [productData, setProductData] = useState(null);

  console.log("productData", productData);

  useEffect(() => {
    async function fetchData() {
      const docRef = doc(db, "post", productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        setProductData(docSnap.data())
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    // Load Bootstrap stylesheet when component mounts
    const styleSheetId = "bootstrap-stylesheet";
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.id = styleSheetId;
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    document.head.appendChild(link);

    return () => {
      // Cleanup: Remove Bootstrap stylesheet when component unmounts
      const sheet = document.getElementById(styleSheetId);
      if (sheet) {
        sheet.disabled = true;
        sheet.parentNode.removeChild(sheet);
      }
    };
  }, []);

  const navigate = useNavigate();

  let navigateToHome = () => {
    navigate(`/`);
  };

  const handleDelete = async () => {
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this ad?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (confirmation.isConfirmed) {
      try {
        // Delete images from Firebase Storage
        if (Array.isArray(productData.postImages)) {
          await Promise.all(
            productData.postImages.map(async (imageUrl) => {
              // Extract the file name from the URL
              const imagePath = imageUrl.split("/post_images%2F")[1].split("?")[0]; // Extract path after 'post_images%2F'
              const imageRef = ref(storage, `post_images/${decodeURIComponent(imagePath)}`); // Decode URI component
              await deleteObject(imageRef);
            })
          );
        } else {
          // If it's a single image (string), delete it
          const imagePath = productData.postImages.split("/post_images%2F")[1].split("?")[0];
          const imageRef = ref(storage, `post_images/${decodeURIComponent(imagePath)}`);
          await deleteObject(imageRef);
        }

        // Delete the post document from Firestore
        await deleteDoc(doc(db, "post", productId));

        Swal.fire('Deleted!', 'Your ad has been deleted.', 'success');

        // Navigate to the homepage
        navigateToHome();
      } catch (error) {
        console.error("Error deleting the post: ", error);
        Swal.fire('Error!', 'Failed to delete the ad. Please try again.', 'error');
      }
    }
  };

  const handleEdit = () => {
    localStorage.setItem("postData", JSON.stringify(productData));
    navigate(`/adpost`);
  }

  return (
    <div className="AdPage">
      {/* Fetch and display the product details based on the productId */}
      <div className="navigation-bar">
        <div><FontAwesomeIcon className="i" icon={faArrowLeft} onClick={navigateToHome} /><img src={require("../../assets/olx_logo.png")} alt="" /></div>
      </div>
      <div className="Adheader my-5">
        <div className="post-details my-3">
          {!productData ? (
            <Skeleton variant="rectangular" width="100%" height={480} className="mb-4" />
          ) : (
            <Carousel
              className="imageCarousel mb-4"
              controls={Array.isArray(productData.postImages) && productData.postImages.length > 1}
              indicators={false}
            >
              {Array.isArray(productData.postImages) ? (
                productData.postImages.map((image, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className="carousel-image mx-auto d-block"
                      src={image}
                      alt={`Slide ${index + 1}`}
                    />
                  </Carousel.Item>
                ))
              ) : (
                <Carousel.Item>
                  <img
                    className="carousel-image mx-auto d-block"
                    src={productData.postImages}
                    alt="Single Slide"
                  />
                </Carousel.Item>
              )}
            </Carousel>
          )}
          <div className="post-title-box">
            <div className="post-price mx-4 mt-3 mb-2">
              {!productData ? (
                <Skeleton variant="text" width="40%" height={40} />
              ) : (
                <h1>{`Rs ${productData.postPrice}`}</h1>
              )}
              <div className="icons">
                {productData && productData.user_id === loginUser ? (
                  <>
                    <FontAwesomeIcon icon={faUserPen} className="i mx-2" onClick={handleEdit} />
                    <FontAwesomeIcon icon={faTrash} className="i" onClick={handleDelete} />
                  </>
                ) : null}
              </div>
            </div>
            <div className="post-title mx-4">
              {!productData ? (
                <Skeleton variant="text" width="60%" height={30} />
              ) : (
                <h4>{productData.postTitle}</h4>
              )}
            </div>
            <div className="user-location my-3 mx-4">
              {!productData ? (
                <Skeleton variant="text" width="50%" height={25} />
              ) : (
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1024 1024" className="cc9ef69b">
                    <path d="M512 85.33c211.75 0 384 172.27 384 384 0 200.58-214.8 392.34-312.66 469.34H440.68C342.83 861.67 128 669.9 128 469.33c0-211.73 172.27-384 384-384zm0 85.34c-164.67 0-298.67 133.97-298.67 298.66 0 160.02 196.89 340.53 298.46 416.6 74.81-56.72 298.88-241.32 298.88-416.6 0-164.69-133.98-298.66-298.67-298.66zm0 127.99c94.1 0 170.67 76.56 170.67 170.67s-76.56 170.66-170.66 170.66-170.67-76.56-170.67-170.66S417.9 298.66 512 298.66zm0 85.33c-47.06 0-85.33 38.28-85.33 85.34s38.27 85.33 85.34 85.33 85.33-38.27 85.33-85.33-38.27-85.34-85.33-85.34z"></path>
                  </svg>
                  {productData.postLocation}
                </p>
              )}
            </div>
          </div>
          <div className="post-details-box my-4">
            <div className="mx-4 my-3"><h3>Details</h3></div>
            <div className="post-brand-price mx-4">
              <div className="post-brand">
                <p>Brand</p>
                {!productData ? (
                  <Skeleton variant="text" width="40%" />
                ) : (
                  <>
                    <p className="bold">{productData.postBrand}</p>
                  </>
                )}
              </div>
              <div className="post-price-section">
                <p>Price</p>
                {!productData ? (
                  <Skeleton variant="text" width="40%" />
                ) : (
                  <>
                    <p className="bold">{productData.postPrice}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="post-description-box">
            <div className="mx-4 my-3"><h3>Description</h3></div>
            <div className="description-text px-4">
              {!productData ? (
                <Skeleton variant="text" width="75%" height={20} />
              ) : (
                <p>{productData.postDescription}</p>
              )}
            </div>
          </div>
        </div>
        <div className="user-details-parent my-3 mx-3">
          <div className="user-details">
            <div className="user-image my-3">
              {!productData ? (
                <Skeleton variant="circular" width={68} height={68} />
              ) : (
                <img src={require("../../assets/pic3.png")} alt="" />
              )}
            </div>
            <div className="user-info mx-3 my-3">
              {!productData ? (
                // <Skeleton variant="text" width="60%" height={30} />
                <Skeleton variant="text" width="124px" height={40} />
              ) : (
                <p className="bold my-3">{productData.postUserName}</p>
              )}
            </div>
          </div>
          <div className="user-btn mb-5">
            {!productData ? (
              <Skeleton variant="text" width="80%" height={50} />
            ) : (
              loginUser || loginUser === productData.user_id ? <button><svg width="26" height="26" viewBox="0 0 1024 1024" className="b32fb7b2"><path d="M784.55 852.4c-331.43-14.64-598.31-281.52-612.94-612.95l149.97-60 91.69 183.43-71 35.5v26.45c0 141.66 115.25 256.9 256.9 256.9h26.45l11.86-23.64 23.68-47.36 183.38 91.74-59.99 149.93zM918.1 643.45L661.16 514.99l-57.47 19.2-30.04 60.03c-74.07-11.1-132.73-69.8-143.87-143.87l60.08-30.04L509 362.88 380.6 105.94l-54.2-20.6-214.18 85.63-26.88 39.8c0 401.37 326.57 727.9 727.94 727.9l39.76-26.88 85.64-214.19-20.61-54.19z"></path></svg><p>{productData && productData.postUserNumber}</p></button> :
                <button onClick={() => navigate("/login")}><svg width="26" height="26" viewBox="0 0 1024 1024" className="b32fb7b2"><path d="M784.55 852.4c-331.43-14.64-598.31-281.52-612.94-612.95l149.97-60 91.69 183.43-71 35.5v26.45c0 141.66 115.25 256.9 256.9 256.9h26.45l11.86-23.64 23.68-47.36 183.38 91.74-59.99 149.93zM918.1 643.45L661.16 514.99l-57.47 19.2-30.04 60.03c-74.07-11.1-132.73-69.8-143.87-143.87l60.08-30.04L509 362.88 380.6 105.94l-54.2-20.6-214.18 85.63-26.88 39.8c0 401.37 326.57 727.9 727.94 727.9l39.76-26.88 85.64-214.19-20.61-54.19z"></path></svg><p>Show phone number</p></button>
            )
            }
          </div>
          <hr />
          <div className="user-location mx-3">
            {!productData ? (
              <>
                <Skeleton variant="text" width="50%" height={25} />
                <Skeleton variant="text" width="50%" height={25} />
              </>
            ) : (
              <>
                <h4>Location</h4>
                <p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1024 1024" className="cc9ef69b">
                    <path d="M512 85.33c211.75 0 384 172.27 384 384 0 200.58-214.8 392.34-312.66 469.34H440.68C342.83 861.67 128 669.9 128 469.33c0-211.73 172.27-384 384-384zm0 85.34c-164.67 0-298.67 133.97-298.67 298.66 0 160.02 196.89 340.53 298.46 416.6 74.81-56.72 298.88-241.32 298.88-416.6 0-164.69-133.98-298.66-298.67-298.66zm0 127.99c94.1 0 170.67 76.56 170.67 170.67s-76.56 170.66-170.66 170.66-170.67-76.56-170.67-170.66S417.9 298.66 512 298.66zm0 85.33c-47.06 0-85.33 38.28-85.33 85.34s38.27 85.33 85.34 85.33 85.33-38.27 85.33-85.33-38.27-85.34-85.33-85.34z"></path>
                  </svg>
                  {productData.postLocation}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="product-footer">
        <p>Free Classifields in Pakistan .&copy; 2006-2022 OLX</p>
      </div>
    </div>
  );
}

export default AdPage;