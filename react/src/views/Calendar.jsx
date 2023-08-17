import React, {useEffect, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axiosClient from '../axios-client.js';
import {Modal} from 'react-bootstrap';

export default function Calendar() {
    const [loading, setLoading] = useState(false);
    const [calendarData, setCalendarData] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [descriptionInput, setDescriptionInput] = useState('');

    const fetchData = () => {
        setLoading(true);
        axiosClient
            .get('/incomes')
            .then(({data}) => {
                const transformedIncomeData = transformIncomeData(data.data);
                axiosClient
                    .get('/expenses')
                    .then(({data}) => {
                        const transformedExpenseData = transformExpenseData(data.data);
                        setCalendarData([...transformedIncomeData, ...transformedExpenseData]);
                    })
                    .catch((error) => {
                        console.log('Unable to fetch data', error);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            })
            .catch((error) => {
                console.log('Unable to fetch data', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        document.title = "Calender";
        fetchData();
    }, []);

    function transformIncomeData(incomeData) {
        return incomeData.map((income) => ({
            title: income.category_name,
            start: income.income_date,
            color: 'rgb(65, 147, 136)',
            additionalData: income,
            classNames: 'income-event',
        }));
    }

    function transformExpenseData(expenseData) {
        return expenseData.map((expense) => ({
            title: expense.category_name,
            start: expense.expense_date,
            color: 'rgb(214, 62, 99)',
            additionalData: expense,
            classNames: 'expense-event',
        }));
    }

    const handleDateSelect = (arg) => {
        setSelectedEvent(null);
        setSelectedDate(arg.start);
        setTextInput('');
        setDescriptionInput('');
        setShowDateModal(true);
    };

    const handleEventClick = (event) => {
        const eventData = event.event._def.extendedProps;
        console.log(eventData);
        setSelectedEvent(eventData);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };


    return (
        <div>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={calendarData}
                selectable={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
            />
            <Modal show={showModal} onHide={handleCloseModal} size="lg" id="modalFillIn" centered className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedEvent?.additionalData?.category_name ?? 'N/A'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEvent?.additionalData && (
                        <div>
                            <table className="footable table table-bordered table-striped mb-0">
                                <thead></thead>
                                <tbody>
                                <tr>
                                    <td width="30%">
                                        <strong>User Name :</strong>
                                    </td>
                                    <td>{selectedEvent.additionalData.user_name}</td>
                                </tr>
                                <tr>
                                    <td width="15%">
                                        <strong>Account Number :</strong>
                                    </td>
                                    <td> {selectedEvent.additionalData.account_number}</td>
                                </tr>
                                <tr>
                                    <td width="15%">
                                        <strong>Bank Name :</strong>
                                    </td>
                                    <td> {selectedEvent.additionalData.bank_name}  </td>
                                </tr>
                                <tr>
                                    <td width="15%">
                                        <strong>Amount :</strong>
                                    </td>
                                    <td> {selectedEvent.additionalData.amount}</td>
                                </tr>
                                <tr>
                                    <td width="15%">
                                        <strong>Description :</strong>
                                    </td>
                                    <td> {selectedEvent.additionalData.description}</td>
                                </tr>
                                <tr>
                                    <td width="15%">
                                        <strong>Note :</strong>
                                    </td>
                                    <td> {selectedEvent.additionalData.note}</td>
                                </tr>
                                <tr>
                                    <td width="15%">
                                        <strong>Reference :</strong>
                                    </td>
                                    <td> {selectedEvent.additionalData.reference}</td>
                                </tr>
                                <tr>
                                    <td width="15%">
                                        <strong>Date :</strong>
                                    </td>
                                    <td>
                                        {selectedEvent?.additionalData?.expense_date ||
                                            selectedEvent?.additionalData?.income_date}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary" onClick={handleCloseModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
