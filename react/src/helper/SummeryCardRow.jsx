import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faXmark} from "@fortawesome/free-solid-svg-icons";
import {Tooltip} from "react-tooltip";
import React, {memo} from "react";


const SummeryCardRow = ({item, handelPayment, currency}) => {

    return (
        <tr key={item.id}>
            <td>{item?.payment_number}</td>
            <td>{currency + ' ' + item?.amount}</td>
            <td>{currency + ' ' + item?.date}</td>
            <td className={item?.status === 'paid' ? 'text-center text-success' : ' text-center text-danger'}>
                {
                    item?.status === 'paid' ?
                        (<FontAwesomeIcon icon={faCheck}/>)
                        :
                        (
                            <>
                                <a onClick={() => handelPayment(item)}
                                   data-tooltip-id='dewa-payment'
                                   data-tooltip-content={"Pay bill for " + item.date}>
                                    <span className="aside-menu-icon">
                                        <FontAwesomeIcon icon={faXmark}/>
                                    </span>
                                </a>
                                <Tooltip id='dewa-payment'/>
                            </>
                        )
                }
            </td>
        </tr>

    )
}

export default memo(SummeryCardRow)