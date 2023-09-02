import React, {memo, useContext} from "react";
import Dropdown from "react-bootstrap/Dropdown";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faThList, faTrash} from "@fortawesome/free-solid-svg-icons";
import { SettingsContext } from "../contexts/SettingsContext";


const ActionButtonHelpers =({module,showModule, deleteFunc, params, editDropdown, showEditDropdown})=>{
    const {applicationSettings, userRole} = useContext(SettingsContext);

return (
    <Dropdown>
        <Dropdown.Toggle variant="success" id="expense-actions">
            Actions
        </Dropdown.Toggle>

        <Dropdown.Menu>
            {userRole === 'admin'&& editDropdown !==true &&
             <Dropdown.Item className="text-warning"
                           href={params.route.editRoute + module.id}>
                <FontAwesomeIcon icon={faEdit}/> Edit
            </Dropdown.Item>}
            
            {editDropdown ===true ? 
                <Dropdown.Item className="text-info"
                            onClick={() => showEditDropdown(module)}>
                    <FontAwesomeIcon icon={faThList}/> Edit
                </Dropdown.Item>
                :
                <Dropdown.Item className="text-info"
                           onClick={() => showModule(module)}>
                    <FontAwesomeIcon icon={faThList}/> View
                </Dropdown.Item>
            }
           

         
             {userRole === 'admin'&&
             <Dropdown.Item className="text-danger"
                           onClick={() => deleteFunc(module)}>
                <FontAwesomeIcon icon={faTrash}/> Delete
            </Dropdown.Item>}

        </Dropdown.Menu>
    </Dropdown>
)
}
export default memo(ActionButtonHelpers);