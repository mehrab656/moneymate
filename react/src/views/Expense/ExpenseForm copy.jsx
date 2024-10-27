import { Col, Container, Modal, Row } from "react-bootstrap";

export default function ExpenseForm() {
  return (
    <Modal
      show={true}
      centered
      onHide={handelCloseModal}
      backdrop="static"
      keyboard={false}
      size={"lg"}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <span>Add new Income</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body></Modal.Body>
      <Modal.Footer>
        <button className="btn btn-primary" onClick={handelCloseModal}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
}
