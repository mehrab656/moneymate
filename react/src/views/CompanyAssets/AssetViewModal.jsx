import React, { memo } from "react";
import { Col, Container, Modal, Row } from "react-bootstrap";

const AssetViewModal = ({ showModal, handelCloseModal, title, data:asset }) => {
  return (
    <>
      <Modal
        show={true}
        centered
        onHide={handelCloseModal}
        className="custom-modal modal-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span>{title}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
                    <table className="table table-bordered border-primary ">
                        <tbody>
                        <tr>
                            <td colSpan={4}>
                                Sector:<strong>{asset?.sector_name}</strong>
                            </td>
                            <td colSpan={2}>
                                Purchase Date:
                                <strong> {asset?.date}</strong>
                            </td>
                            <td colSpan={1}>
                                Status:
                                <strong> {asset?.status === 1? "Active": "Paused"}</strong>
                            </td>
                        </tr>

                        <tr>
                            <td rowSpan={3}>Balance</td>
                            <td colSpan={6}>Total Asset Amount:<strong> {asset?.total_price}</strong></td>
                        </tr>
                        <tr>
                            <td colSpan={6}>Damaged Asset's Amount:<strong> {asset?.total_damaged}</strong></td>
                        </tr>
                        <tr><td colSpan={6}>Asset Used Amount:<strong>{asset?.total_used}</strong></td></tr>
                        <tr>
                            <td colSpan={7} className={"text-center"}>
                                <strong>Asset Information</strong>
                            </td>
                        </tr>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total Price</th>
                            <th>Current Stock</th>
                        </tr>
                        {asset?.assets.map((_asset,index)=>{
                            return (
                                <tr>
                                    <td>{index+1}</td>
                                    <td>{_asset?.name}</td>
                                    <td>{_asset?.description}</td>
                                    <td>{_asset?.qty}</td>
                                    <td>{_asset?.unit_price}</td>
                                    <td>{_asset?.total_price}</td>
                                    <td>{_asset?.current_stock??_asset?.qty}</td>
                                </tr>
                            )
                        })}
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
  );
};
export default memo(AssetViewModal);
