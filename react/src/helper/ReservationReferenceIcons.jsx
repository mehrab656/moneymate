import {FaAirbnb, FaMoneyBillAlt} from "react-icons/fa";
import React, {memo} from "react";

const ReservationReferenceIcons = ({reff}) => {

    switch (reff) {
        case 'air':
            return <FaAirbnb className={'logo-reservations'} color="red"/>
        case 'booking':
            return <i className="logo-bookingcom logo-reservations"></i>
        case 'vrbo':
            return <FaAirbnb className={'logo-reservations'} color="red"/>
        case 'expedia':
            return <FaAirbnb className={'logo-reservations'} color="red"/>
        case 'Cash':
            return <FaMoneyBillAlt fontSize={20} color="gray"/>
        case 'cheque':
            return <FaAirbnb className={'logo-reservations'} color="red"/>
        default:
            return 'Not Defined'

    }
}
export default memo(ReservationReferenceIcons)