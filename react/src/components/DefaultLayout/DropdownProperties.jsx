import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import React, {memo} from "react";
const DropDownProperties = ({icon, totalNotification}) => {
    const color = totalNotification < 3 ? '#50CD89' : '#F1416C';
    return (
        <>
            <span style={{color: color}}>({totalNotification})</span><FontAwesomeIcon icon={icon} color={color}/>
        </>
    )
}
export default memo(DropDownProperties)