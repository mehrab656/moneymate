import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { memo } from "react";

const DropDownProperties = ({ icon, totalNotification }) => {
    const color = totalNotification < 3 ? '#50CD89' : '#F1416C';

    return (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <FontAwesomeIcon icon={icon} color={color} />
            {totalNotification > 0 && (
                <span 
                    style={{
                        backgroundColor: color,
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '0.55rem',
                        position: 'absolute',
                        top: '-14px',
                        right: '-10px',
                    }}
                >
                    {totalNotification}
                </span>
            )}
        </div>
    );
}

export default memo(DropDownProperties);
