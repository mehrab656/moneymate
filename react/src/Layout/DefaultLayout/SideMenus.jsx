// SideMenus.js
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { genRand } from '../../helper/HelperFunctions';
import { getSideMenus } from './SideMenuConfig'; // adjust path

const SideMenus = ({ isActive, toggleSubmenu, handleCloseSidebar, submenuVisible, checkPermission }) => {
  const sideMenus = useMemo(() => getSideMenus(isActive, submenuVisible), [isActive, submenuVisible]);

  // handle single menu
  const handleSingleMenu = ()=>{
      handleCloseSidebar();
      toggleSubmenu('single')
  }

  return (
    <ul className="aside-menu">
      {sideMenus.map((menu, index) => {
        if (menu.hasMultiMenu) {
          return (
            <li className="aside-menu-item" key={index}>
              <a onClick={() => toggleSubmenu(menu.mainMenu.onClickToggleType)} className="dropdown-menu">
                <span className="aside-menu-icon"><FontAwesomeIcon icon={menu.mainMenu.icon} /></span>
                <span className="aside-menu-text">{menu.mainMenu.text}</span>
                <span className="submenu-toggle-icon">{menu.mainMenu.subIcon}</span>
              </a>
              {menu.submenuShowPermission && (
                <ul className="submenu scrollable-submenu">
                  {menu.subMenus.map(submenu => checkPermission(submenu.permission) && (
                    <li className="aside-menu-item" key={submenu.permission + genRand(8)} onClick={() => handleCloseSidebar()}>
                      <Link to={submenu.link.to} className={submenu.link.className}>
                        <span className="aside-menu-icon"><FontAwesomeIcon icon={submenu.icon} /></span>
                        <span className="aside-menu-text">{submenu.text}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        } else {
          return checkPermission(menu.permission) && (
            <li className={menu.className} key={index} onClick={handleSingleMenu}>
              <Link to={menu.link.to} className={menu.link.className}>
                <span className="aside-menu-icon"><FontAwesomeIcon icon={menu.icon} /></span>
                <span className="aside-menu-text">{menu.text}</span>
              </Link>
            </li>
          );
        }
      })}
    </ul>
  );
};

export default SideMenus;
