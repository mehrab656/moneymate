import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTachometerAlt} from "@fortawesome/free-solid-svg-icons";
import React from "react";

export default function AsideDropdown({ onClick }){
    return (
        <>
        {/*<div>*/}
        {/*    <button onClick={onClick}>Click me</button>*/}
        {/*</div>*/}
        {/*    <Link onClick={onClick}>*/}
        {/*        <span className="aside-menu-icon"><FontAwesomeIcon icon={faTachometerAlt}/></span>*/}
        {/*        <span className="aside-menu-text"> Dropdown Menu</span>*/}
        {/*    </Link>*/}
        {/*    <div className="aside-dropdown-menu">*/}
        {/*        <ul className="aside-submenu">*/}
        {/*            <li className="aside-menu-item">*/}
        {/*                <Link*/}
        {/*                    to="/dashboard"*/}
        {/*                    className={isActive('/dashboard') ? 'active' : ''}*/}
        {/*                    onClick={() => handleLinkClick('/dashboard')}>*/}
        {/*                    <span className="aside-menu-icon"><FontAwesomeIcon icon={faTachometerAlt}/></span>*/}
        {/*                    <span className="aside-menu-text"> Dashboard</span>*/}
        {/*                </Link>*/}
        {/*            </li>*/}
        {/*        </ul>*/}
        {/*    </div>*/}
        </>
    );
};