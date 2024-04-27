import React, {memo} from "react";


const CalenderModalBody = ({additionalData, eventType}) => {
    return (
        <>
            { (eventType === 'expense-event' || eventType === 'income-event') &&
                <>
                    <tr>
                        <td width="30%">
                            <strong>User Name :</strong>
                        </td>
                        <td>{additionalData.user_name}</td>
                    </tr>
                    <tr>
                        <td width="15%">
                            <strong>Account Number :</strong>
                        </td>
                        <td> {additionalData.account_number}</td>
                    </tr>
                    <tr>
                        <td width="15%">
                            <strong>Bank Name :</strong>
                        </td>
                        <td> {additionalData.bank_name}  </td>
                    </tr>
                    <tr>
                        <td width="15%">
                            <strong>Amount :</strong>
                        </td>
                        <td> {additionalData.amount}</td>
                    </tr>
                    <tr>
                        <td width="15%">
                            <strong>Description :</strong>
                        </td>
                        <td> {additionalData.description}</td>
                    </tr>
                    <tr>
                        <td width="15%">
                            <strong>Note :</strong>
                        </td>
                        <td> {additionalData.note}</td>
                    </tr>
                    <tr>
                        <td width="15%">
                            <strong>Reference :</strong>
                        </td>
                        <td> {additionalData.reference}</td>
                    </tr>
                    <tr>
                        <td width="15%">
                            <strong>Date :</strong>
                        </td>
                        <td>
                            {additionalData?.date ||
                                additionalData?.date}
                        </td>
                    </tr>
                </>

            }
            {
                (eventType === 'payment-event') &&
                <>
                    <tr>
                        <td width="15%">
                            <strong>Details :</strong>
                        </td>
                        <td> {additionalData.payment_number}</td>
                    </tr>
                    <tr>
                        <td width="15%">
                            <strong>Amount :</strong>
                        </td>
                        <td> {additionalData.amount}</td>
                    </tr>
                    <tr>
                        <td width="15%">
                            <strong>Bill Type :</strong>
                        </td>
                        <td> {additionalData.type}</td>
                    </tr>
                    <tr>
                        <td width="15%">
                            <strong>Additional Notes :</strong>
                        </td>
                        <td> {additionalData.note}</td>
                    </tr>
                    <tr>
                        <td width="15%">
                            <strong>Payment Date :</strong>
                        </td>
                        <td>
                            {additionalData?.date ||
                                additionalData?.date}
                        </td>
                    </tr>
                </>
            }


        </>
    )
}

export default memo(CalenderModalBody)