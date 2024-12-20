import "./index.css";
import { useEffect, useState } from "react";
import { db, collection, getDocs } from "../../config/firebase";
import Skeleton from '@mui/material/Skeleton';
import { useNavigate } from "react-router-dom";

function Products({ selectedLocation, setProductTitles, filteredProducts, loginUser, showMyAds }) {
    const [products, setProducts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const querySnapshot = await getDocs(collection(db, "post"));
            let posts = [];
            querySnapshot.forEach((doc) => {
                posts.push({ id: doc.id, ...doc.data() });
            });
            setProducts(posts);
            let postTitles = posts.map(post => {
                return { postTitle: post.postTitle, postLocation: post.postLocation };
            });
            setProductTitles(postTitles);
            setLoading(false);
        }
        fetchData();
    }, []);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 500); // simulate loading time
        return () => clearTimeout(timer);
    }, [selectedLocation, filteredProducts, showMyAds]);

    const filterProducts = (products, location) => {
        if (location === "" || location === "See ads in all Pakistan") {
            return products;
        }
        return products.filter(product => product.postLocation === location);
    };

    // Filter products for "My Ads"
    const filteredLocationProducts = products ? filterProducts(products, selectedLocation) : [];
    const myAdsFilteredProducts = showMyAds
        ? filteredLocationProducts.filter(product => product.user_id === loginUser) // Filter by user's ID
        : filteredLocationProducts;

    const finalFilteredProducts = filteredProducts
        ? myAdsFilteredProducts.filter(product => product.postTitle.toLowerCase().includes(filteredProducts.toLowerCase()))
        : myAdsFilteredProducts;

    const chunkArray = (array, size) => {
        const chunked = [];
        for (let i = 0; i < array.length; i += size) {
            chunked.push(array.slice(i, i + size));
        }
        return chunked;
    };

    const rows = finalFilteredProducts ? chunkArray(finalFilteredProducts, 4) : [];

    const skeleton = (
        <div className="First_row">
            {Array.from(new Array(4)).map((_, index) => (
                <div className="box-skeleton" key={index}>
                    <Skeleton variant="rectangular" height={154} />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" />
                </div>
            ))}
        </div>
    );

    const navigate = useNavigate();

    function goToProductPage(productId) {
        navigate(`/adpage/${productId}`);
    }

    return (
        <div className="product">
            {loading || products === null
                ? Array.from(new Array(3)).map((_, index) => (
                    <div key={index}>{skeleton}</div>
                )) // Render skeletons while loading
                : finalFilteredProducts.length === 0
                    ? <div className="no-ad-message">
                        <h3>No ads found for this location or user</h3>
                        <img className="notFoundImg" src={require("../../assets/iconNotFound.webp")} alt="Not Found" />
                    </div>
                    : rows.map((row, rowIndex) => (
                        <div className="First_row" key={rowIndex}>
                            {row.map((product) => (
                                <div className="box" key={product.id} onClick={() => goToProductPage(product.id)}>
                                    <div className="img-box">
                                        <img src={Array.isArray(product.postImages) ? product.postImages[0] : product.postImages} alt="" />
                                    </div>
                                    <p>{product.postTitle}</p>
                                    <h2>Rs {product.postPrice}</h2>
                                    <div className="addres_data"><p>{product.postLocation}</p>
                                        {loginUser === product.user_id ? <p className="myAd">My Ad</p> : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
        </div>
    );
}

export default Products;


