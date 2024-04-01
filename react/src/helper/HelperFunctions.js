import Swal from "sweetalert2";

export function compareDates(date) {
    const currentDate = new Date().getTime();
    const billingDate = new Date(date).getTime();

    //if current date is greater than billing date, it means it has been overdue bill. send warning.
    if (currentDate > billingDate) {
        return "warning";
    }
    //else calculate the days
    const diff_in_time = new Date(date) - new Date();
    const diff_in_days = Math.round(diff_in_time / (1000 * 3600 * 24));
    return diff_in_days >= 5 ? "success" : "danger";
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

