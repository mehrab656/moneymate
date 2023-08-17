import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMoneyCheck} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import WizCard from "./WizCard";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
export default function SummeryCard({icon, value, iconClassName, summary, currency = ''}) {
    return(
        <WizCard className="h-100">
            <div>
                <div className={iconClassName + ' summary-icon'}>{icon}</div>
                <div className="summary-value mt-3 mb-2">{currency + value}</div>
                <div className="summery-title-text">
                    {summary}
                </div>
            </div>
        </WizCard>
    )
}
