import "./index.css";
function DownloadSection() {
    return (
        <>
            <div className="download">
                <img src={require("../../assets/footar.jpg")} className="images" />

                <div className="text">
                    <h1>TRY THE OLX APP</h1>
                    <p>
                        Buy, sell and find just about anything using <br />
                        the app on your mobile.
                    </p>
                </div>
                <div className="download_store">
                    <p>GET YOUR APP TODAY</p>
                    <img src={require("../../assets/play store.png")} alt="" />
                </div>
            </div>
            <hr />
        </>
    )
}

export default DownloadSection;