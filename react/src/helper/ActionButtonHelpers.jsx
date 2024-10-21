import React, {memo, useContext} from "react";
import Dropdown from "react-bootstrap/Dropdown";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faThList, faTrash} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../contexts/SettingsContext";
import {useNavigate} from "react-router-dom";
import {checkPermission} from "./HelperFunctions.js";


const ActionButtonHelpers = ({actionBtn, element}) => {
    const navigate = useNavigate()
    return (
        <>
            <Dropdown>
            <Dropdown.Toggle variant="primary" className={"btn-sm"} id="expense-actions">
                Actions
            </Dropdown.Toggle>

            <Dropdown.Menu className="actionDropDownMenu">
                {
                    actionBtn.map(menu=>{
                       return (
                            <Dropdown.Item className={menu.textClass} key={Math.random().toString(36).substring(2)}
                                onClick={(e) => menu.type==='modal'?menu.actionFunction(element?.id):navigate(`${menu.route}${element?.id}`)}>
                                <FontAwesomeIcon icon={faEdit}/> {menu.actionName}
                            </Dropdown.Item>
                        )
                    })
                }

                {/*{checkPermission(editDropdown) &&*/}
                {/*    <Dropdown.Item className="text-warning"*/}
                {/*                   onClick={(e) => navigate(`${params.route.editRoute}${module.id}`)}>*/}
                {/*        <FontAwesomeIcon icon={faEdit}/> Edit*/}
                {/*    </Dropdown.Item>*/}
                {/*}*/}
                {/*{checkPermission(showPermission) &&*/}
                {/*    <Dropdown.Item className="text-info"*/}
                {/*                   onClick={() => showModule(module)}>*/}
                {/*        <FontAwesomeIcon icon={faThList}/> View*/}
                {/*    </Dropdown.Item>*/}
                {/*}*/}
                {/*{checkPermission(deletePermission) &&*/}
                {/*    <Dropdown.Item className="text-danger"*/}
                {/*                   onClick={() => deleteFunc(module)}>*/}
                {/*        <FontAwesomeIcon icon={faTrash}/> Delete*/}
                {/*    </Dropdown.Item>*/}
                {/*}*/}


                {/*{showEditDropdown ?*/}
                {/*    <Dropdown.Item className="text-info"*/}
                {/*                   onClick={() => showEditDropdown(module)}>*/}
                {/*        <FontAwesomeIcon icon={faThList}/> Edit*/}
                {/*    </Dropdown.Item>*/}
                {/*    : ''*/}
                {/*}*/}
            </Dropdown.Menu>
        </Dropdown>
        </>
    )
}
export default memo(ActionButtonHelpers);