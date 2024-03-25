import Swal from "sweetalert2";

export function compareDates(date) {
    const currentDate = new Date().getTime();
    const billingDate = new Date(date).getTime();

    //if current date is greater than billing date, it means it has been overdue bill. send warning.
    if (currentDate>billingDate){
        return "warning";
    }
    //else calculate the days
    const diff_in_time = new Date(date) - new Date();
    const diff_in_days = Math.round(diff_in_time/(1000*3600*24));
    return diff_in_days >= 5 ? "success" : "danger";
}


