import React, {memo, useContext} from "react";
import Dropdown from "react-bootstrap/Dropdown";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faThList, faTrash} from "@fortawesome/free-solid-svg-icons";
import {SettingsContext} from "../contexts/SettingsContext";
import {useNavigate} from "react-router-dom";
import {checkPermission} from "./HelperFunctions.js";


const ActionButtonHelpers = ({
                                 module,
                                 showModule,
                                 deleteFunc,
                                 params,
                                 editDropdown,
                                 showEditDropdown,
                                 showPermission,
                                 deletePermission,
                                 contractExtend = false,
                                 contractShowModule
                             }) => {
    const {applicationSettings, userRole} = useContext(SettingsContext);
    const navigate = useNavigate()
    return (
        <Dropdown>
            <Dropdown.Toggle variant="primary" className={"btn-sm"} id="expense-actions">
                Actions
            </Dropdown.Toggle>

            <Dropdown.Menu className="actionDropDownMenu">
                {checkPermission(editDropdown) &&
                    <Dropdown.Item className="text-warning"
                                   onClick={(e) => navigate(`${params.route.editRoute}${module.id}`)}>
                        <FontAwesomeIcon icon={faEdit}/> Edit
                    </Dropdown.Item>
                }
                {checkPermission(showPermission) &&
                    <Dropdown.Item className="text-info"
                                   onClick={() => showModule(module)}>
                        <FontAwesomeIcon icon={faThList}/> View
                    </Dropdown.Item>
                }
                {checkPermission(deletePermission) &&
                    <Dropdown.Item className="text-danger"
                                   onClick={() => deleteFunc(module)}>
                        <FontAwesomeIcon icon={faTrash}/> Delete
                    </Dropdown.Item>
                }


                {/*{showEditDropdown ?*/}
                {/*    <Dropdown.Item className="text-info"*/}
                {/*                   onClick={() => showEditDropdown(module)}>*/}
                {/*        <FontAwesomeIcon icon={faThList}/> Edit*/}
                {/*    </Dropdown.Item>*/}
                {/*    : ''*/}
                {/*}*/}
                {
                    contractExtend ?
                        <Dropdown.Item className="text-info"
                                       onClick={() => contractShowModule(module)}>
                            <FontAwesomeIcon icon={faThList}/> Extend Contract
                        </Dropdown.Item>
                        : ''
                }
            </Dropdown.Menu>
        </Dropdown>
    )
}
export default memo(ActionButtonHelpers);