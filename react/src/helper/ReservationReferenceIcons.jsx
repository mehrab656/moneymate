import {FaAirbnb, FaGoogle, FaMoneyBillAlt, FaPiggyBank, FaRegBuilding} from "react-icons/fa";
import React, {memo} from "react";

const ReservationReferenceIcons = ({reff}) => {

    switch (reff) {
        case 'air':
        case 'air-bnb':
            return <FaAirbnb className={'logo-reservations'} color="red"/>
        case 'booking':
        case 'booking.com':
            return <i className="logo-bookingcom logo-reservations"></i>
        case 'vrbo':
            return <i className="logo-vrbo logo-reservations"></i>
        case 'expedia':
            return <i className="logo-expedia logo-reservations"></i>
        case 'Cash':
        case 'cash':
        case 'Cash Guest':
        return <FaMoneyBillAlt fontSize={20} color="gray"/>
        case 'cheque':
            return <i className="logo-cheque logo-reservations"></i>
        case 'bank':
            return <i className="logo-bank-transfer logo-reservations"></i>
        case 'google':
            return <FaGoogle className={'google'} color="red"/>
        case 'agoda':
            return <i className="logo-agoda logo-reservations"></i>
        case 'trivago':
            return <i className="logo-trivago logo-reservations"></i>
        case 'host-away':
            return <i className="logo-hostaway logo-reservations"></i>

        default:
            return <i className="logo-undefined logo-reservations"></i>

    }
}
export default memo(ReservationReferenceIcons)