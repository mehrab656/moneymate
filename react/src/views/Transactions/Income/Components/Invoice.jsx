import {Modal} from "react-bootstrap";
import GlobalInvoice from "../../../../components/GlobalInvoice.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import React, {useRef} from "react";
import { useReactToPrint } from "react-to-print";
import GlobalInvoiceLayout2 from "../../../../components/GlobalInvoiceLayout2.jsx";

export default function Invoice({showModal,closeModal,invoice}){
    const printRef = useRef(null);
    const printInvoice = useReactToPrint({
        content: () => printRef.current,
        documentTitle: "income-invoice",
        pageStyle: `
      @page { size: A4; margin: 12mm; }
      body { -webkit-print-color-adjust: exact; color-adjust: exact; }
    `,
    });



    return (
        <Modal centered
               show={showModal}
               onHide={closeModal}
               size="lg"
               dialogClassName="invoice-modal">
            <Modal.Body style={{padding:"0px"}}>
                <div ref={printRef}>
                    {/*<GlobalInvoice data={income || {}} />*/}
                    <GlobalInvoiceLayout2 invoice={invoice} />
                </div>
            </Modal.Body>
            <Modal.Footer className={"invoice-footer"}>
                <button className={"btn primary-theme-btn btn-sm"} onClick={printInvoice}>
                    <FontAwesomeIcon icon={faDownload} /> Print
                </button>
                <button className={"btn primary-theme-btn btn-sm"} onClick={closeModal}>
                    Close
                </button>
            </Modal.Footer>
        </Modal>
    );
}