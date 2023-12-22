import {Modal} from "react-bootstrap";
import DownloadAttachment from "../components/DownloadAttachment.jsx";
import React, {memo} from "react";


const ExpenseModal = ({showModal, handelCloseModal, title, data}) => {
    return (
        <>
            <Modal show={showModal} centered onHide={handelCloseModal} className="custom-modal modal-lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>{title}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table className="footable table table-bordered table-striped mb-0">
                        <thead/>
                        <tbody>
                        <tr>
                            <td width="50%">
                                <strong>User Name :</strong>
                            </td>
                            <td>{data.user_name}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Account Number :</strong>
                            </td>
                            <td> {data.account_number}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Bank Name :</strong>
                            </td>
                            <td> {data.bank_name}  </td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Expense Amount :</strong>
                            </td>
                            <td> {data.amount}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Refundable Amount :</strong>
                            </td>
                            <td> {data.refundable_amount}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Refunded Amount :</strong>
                            </td>
                            <td> {data.refunded_amount}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Description :</strong>
                            </td>
                            <td> {data.description}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Note :</strong>
                            </td>
                            <td> {data.note}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Reference :</strong>
                            </td>
                            <td> {data.reference}</td>
                        </tr>
                        <tr>
                            <td width="50%">
                                <strong>Date :</strong>
                            </td>
                            <td>
                                {data.date}
                            </td>
                        </tr>

                        <tr>
                            <td width="50%">
                                <strong>Attachments :</strong>
                            </td>

                            <td>{data.attachment &&
                                // <Image src={window.URL.createObjectURL(data.attachment)} fluid/>
                                <DownloadAttachment filename={data.attachment}/>
                            }
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary" onClick={handelCloseModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default memo(ExpenseModal)