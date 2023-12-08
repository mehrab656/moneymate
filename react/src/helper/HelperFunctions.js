export function compareDates(date) {
    const currentDate = new Date().getDate();

    const billingDate = new Date(date).getDate();
    const res = billingDate - currentDate;
    return res >= 5 ? "success" : "danger";
}
