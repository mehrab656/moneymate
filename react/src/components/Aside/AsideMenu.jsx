import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTachometerAlt} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import React from "react";

export default function AsideMenu() {
    return(
        <>
            <ul className="aside-menu">

            </ul>

            <Link
                to="/dashboard"
                className={isActive('/dashboard') ? 'active' : ''}
                onClick={() => handleLinkClick('/dashboard')}>
                <FontAwesomeIcon icon={faTachometerAlt}/>
                <span> Dashboard</span>
            </Link>
        </>
    )
}
