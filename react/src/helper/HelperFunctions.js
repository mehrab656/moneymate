import Swal from "sweetalert2";
import axiosClient from "../axios-client.js";
import {Box, Button, Tooltip} from "@mui/material";
import {useContext} from "react";
import {SettingsContext} from "../contexts/SettingsContext.jsx";





export function compareDates(billDate) {
    const currentDate = new Date().getTime();  //19 May
    const billingDate = new Date(billDate).getTime(); // 18 May

    //if current date is greater than billing date, it means it has been overdue bill. send warning.
    if (currentDate > billingDate) {
        return "danger";
    }
    //else calculate the days
    const diff_in_time = new Date(billDate) - new Date();
    const diff_in_days = Math.round(diff_in_time / (1000 * 3600 * 24));
    return diff_in_days >= 5 ? "success" : "warning";
}

export function reservationValidationBuilder(check_in, check_out) {
    let _message = '';
    let _class = '';

    if (!check_in) {
        _message = `Select Checkin Date first`;
        _class = `danger`;
    }
    if (check_in === check_out) {
        _message = `Same day check in and check out.`;
        _class = `warning`;

    }
    if (check_in > check_out) {
        _message = `Checkout date can not be back date than check in date.`;
        _class = `danger`;
    }
    if (check_out > check_in) {
        const checkin = new Date(check_in);
        const checkout = new Date(check_out);
        const diff = (checkout - checkin) / (1000 * 60 * 60 * 24);
        _message = `${diff} nights`;
        _class = `success`;
    }

    return {
        message: _message,
        class: _class
    }
}
export const checkPermission = (permission, _checkLimit = false)=>{
    const { userRole,userPermission} = useContext(SettingsContext);
    if (userRole === 'admin' || permission === 'admin') {
        return true;
    }
    else if(userRole === 'baseUser'){
        return true; //@FIx Me for base user and subscriptions limit.
    }
    else { // sub-user
        return userPermission[permission];
    }
}


// export const checkPermission = (permission, _checkLimit = false)=>{
//
//     // const { userRole,userPermission} = useContext(SettingsContext);
//     console.log(userPermission())
//
// }
