import "./index.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
function Navbar2() {
    return (
        <div className="navbar2-parent">
            <div className="navbar2">
                <ul>
                    {/* <!-- <h5 id="showads">Show My Ads Only</h5> --> */}
                    <h5>All CATEGORIES</h5>
                    <FontAwesomeIcon className="move-icon" icon={faChevronDown} />
                    <li>Mobile Phones</li>
                    <li>Cars</li>
                    <li>Motorcycles</li>
                    <li>Houses</li>
                    <li>TV-Video-Audio</li>
                    <li>Tablets</li>
                    <li>Land & Plots</li>
                </ul>
            </div>
        </div>
    )
}

export default Navbar2
