import TaskHistoryModal from "./TaskHistoryModal.jsx";
import Image from "react-bootstrap/Image";
import React from "react";

const TimelineItem = ({data:{date_time,type,description,userName,avatar}}) => {
    const date = new Date(date_time)
    const formatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedTime = formatter.format(date);
    const bgColor = (status)=>{
        if (status==='create' || status==='done' || status==='payment_done'){
            return '#198754';
        }
       else if (status==='comment'){
            return '#0dcaf0';
        }
        else if (status==='status_change' || status==='payment_status_change'){
            return '#ffc107';
        }
        else{
            return '#bb2124'
        }
    }
    return (
        <div className="timeline-item">
            <div className="timeline-item-content">
            <span className="tag" style={{background: bgColor(type)}}>
                {(type).replaceAll('_', ' ')}
            </span> <Image src={avatar} roundedCircle style={{height:'50px',width:'50px'}}/>
                <br/>
                <p>{description.toUpperCase()}</p>
                <b>{userName}</b>
                <span className="circle"/>
                <time>{date.toDateString() + ' ' + formattedTime}</time>
            </div>
        </div>
    )
};

export default TimelineItem;

