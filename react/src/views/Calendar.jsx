import React, {useEffect, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axiosClient from '../axios-client.js';
import {Modal} from 'react-bootstrap';
import MainLoader from '../components/MainLoader.jsx';
import CalenderModalBody from "../helper/CalenderModalBody.jsx";

export default function Calendar() {
    const [loading, setLoading] = useState(false);
    const [calendarData, setCalendarData] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        document.title = "Calender";

        setLoading(true);

        axiosClient.get('/calender-report').then(({data: {calenderData}}) => {
            setCalendarData(calenderData);
            setLoading(false);
        }).catch(() => {
            console.warn('fetch error')
        })
    }, [])

    const handleEventClick = (event) => {

        const eventData = event.event._def.extendedProps;
        const eventClass = event.event.classNames[0];
        setSelectedEvent({...eventData, eventType: eventClass});
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (<div>
            <MainLoader loaderVisible={loading}/>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={calendarData}
                selectable={true}
                eventClick={handleEventClick}
            />
            <Modal show={showModal} onHide={handleCloseModal} size="lg" id="modalFillIn" centered
                   className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedEvent?.additionalData?.category_name ?? selectedEvent?.additionalData?.payment_number}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEvent?.additionalData && (<div>
                            <table className="footable table table-bordered table-striped mb-0">
                                <thead></thead>
                                <tbody>
                                <CalenderModalBody additionalData={selectedEvent.additionalData}
                                                   eventType={selectedEvent.eventType}
                                />

                                </tbody>
                            </table>
                        </div>)}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary" onClick={handleCloseModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </div>);
}
