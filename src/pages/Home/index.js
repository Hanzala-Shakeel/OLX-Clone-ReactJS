import { useState } from 'react';
import Header from '../../components/Header';
import Navbar2 from "../../components/Navbar2";
import TopImage from "../../components/TopImage";
import Products from "../../components/Products";
import DownloadSection from '../../components/DownloadSection';
import Footer from '../../components/Footer';

function Home({ loginUser, setloginUser }) {
    const [selectedLocation, setSelectedLocation] = useState("");
    const [productTitles, setProductTitles] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState(null);
    const [showMyAds, setShowMyAds] = useState(false); // State to track if "My Ads" is clicked

    // console.log("Home", productTitles);

    return (
        <>
            <Header
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                productTitles={productTitles}
                setFilteredProducts={setFilteredProducts}
                loginUser={loginUser}
                setloginUser={setloginUser}
                setShowMyAds={setShowMyAds} // Pass this to Header
            />
            <Navbar2 />
            <TopImage />
            <Products
                selectedLocation={selectedLocation}
                setProductTitles={setProductTitles}
                filteredProducts={filteredProducts}
                loginUser={loginUser}
                showMyAds={showMyAds} // Pass this to Products
            />
            <DownloadSection />
            <Footer />
        </>
    );
}

export default Home;
