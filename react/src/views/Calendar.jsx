import React, {useEffect, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axiosClient from '../axios-client.js';
import {Modal} from 'react-bootstrap';
import MainLoader from '../components/MainLoader.jsx';

export default function Calendar() {
    const [loading, setLoading] = useState(false);
    const [calendarData, setCalendarData] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [descriptionInput, setDescriptionInput] = useState('');

    useEffect(() => {
        document.title = "Calender";

        setLoading(true);

        axiosClient.get('/calender-report').then(({data:{calenderData}})=>{
            setCalendarData(calenderData);
            setLoading(false);
        }).catch(()=>{
            console.warn('fetch error')
        })
    },[])

    const handleDateSelect = (arg) => {
        setSelectedEvent(null);
        setSelectedDate(arg.start);
        setTextInput('');
        setDescriptionInput('');
        setShowDateModal(true);
    };

    const handleEventClick = (event) => {
        const eventData = event.event._def.extendedProps;
        setSelectedEvent(eventData);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };


    return (
        <div>
            <MainLoader loaderVisible={loading}/>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={calendarData}
                selectable={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
            />
            <Modal show={showModal} onHide={handleCloseModal} size="lg" id="modalFillIn" centered
                   className="custom-modal">
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
                                        {selectedEvent?.additionalData?.date ||
                                            selectedEvent?.additionalData?.date}
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
