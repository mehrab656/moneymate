import NavDropdown from "react-bootstrap/NavDropdown";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFilter} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import React, {memo} from "react";
import {Row} from "react-bootstrap";

const ExpenseFilter = ({
                           params,
                           setParam,
                           handleSubmit,
                           sectors,
                           expenseCategories,
                           resetFilterParameter,
                           hasFilter
                       }) => {
    return (
        <NavDropdown className={'filter-icon'}
                     title={<FontAwesomeIcon icon={faFilter} title={'Filter'} color={hasFilter ? 'green' : 'red'}
                     />}>
            <form className={"p-2"} onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="custom-form-label" htmlFor="expense_category"><small>Filter by
                        Sectors</small></label>
                    <select
                        className="custom-form-control"
                        value={params.sec_id}
                        id="sector"
                        name="sector"
                        onChange={(event) => {
                            const value = event.target.value || '';
                            setParam({...params,sec_id:value,cat_id:''});
                        }}>
                        <option defaultValue>Filter By Sectors</option>
                        {sectors.map(sector => (
                            <option key={"sec-" + sector.value} value={sector.value}>
                                {sector.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="custom-form-label" htmlFor="expense_category"><small>Filter by Expense
                        Category</small></label>
                    <select
                        className="custom-form-control"
                        value={params.cat_id}
                        id="expense-category"
                        name="expense-category"
                        onChange={(event) => {
                            const value = event.target.value || '';
                            setParam({...params,cat_id:value});
                        }}>
                        <option defaultValue>Filter By Category</option>
                        {expenseCategories.map(category => (
                            <option key={'cat-' + category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="row">
                    <div className="col-5">
                        <div className="form-group">
                            <label className="custom-form-label" htmlFor="start_date"><small>Filter by
                                date</small></label>
                            <DatePicker
                                className="custom-form-control"
                                id="start_date"
                                selected={params.start_date}
                                onChange={(date) => setParam({...params,start_date:date})}
                                dateFormat="yyyy-MM-dd"
                                placeholderText='Start Date'
                            />
                        </div>
                    </div>
                    <div className="col-2 d-flex justify-content-sm-center align-items-center">To</div>
                    <div className="col-5">
                        <div className="form-group">
                            <label className="custom-form-label" htmlFor="end_date"
                                   style={{marginBottom: "32px"}}></label>
                            <DatePicker
                                className="custom-form-control"
                                id="end_date"
                                selected={params.end_date}
                                onChange={(date) => setParam({...params,end_date:date})}
                                dateFormat="yyyy-MM-dd"
                                placeholderText='End Date'
                            />
                        </div>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='custom-form-label' htmlFor='search'>
                        Search by keywords
                    </label>
                    <input
                        className='custom-form-control'
                        placeholder='search by keywards'
                        value={params.search_terms}
                        onChange={(ev) =>
                            setParam({...params,search_terms:ev.target.value})
                        }
                    />
                </div>
                <div className="row">
                    <div className="col-4">
                        <div className="form-group">
                            <label className="custom-form-label" htmlFor="expense_category"><small>Order
                                By</small></label>
                            <select
                                className="custom-form-control"
                                value={params.orderBy}
                                id="expense-category"
                                name="expense-category"
                                onChange={(event) => {
                                    const value = event.target.value || '';
                                    setParam({...params, orderBy: value});
                                }}>
                                <option defaultValue>Filter By Order Column</option>
                                <option value={'id'}>{'Id'}</option>
                                <option value={'date'}>{'Date'}</option>
                                <option value={'amount'}>{'Amount'}</option>
                                <option value={'refundable_amount'}>{'Refundable Amount'}</option>
                                <option value={'refunded_amount'}>{'Refunded Amount'}</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-4">
                        <div className="form-group">
                            <label className="custom-form-label" htmlFor="order"><small>Order</small></label>
                            <select
                                className="custom-form-control"
                                value={params.order}
                                id="order"
                                name="order"
                                onChange={(event) => {
                                    const value = event.target.value || '';
                                    setParam({...params, order: value});
                                }}>
                                <option defaultValue>Filter By Order</option>
                                <option value={'DESC'}>{'DESCENDING'}</option>
                                <option value={'ASC'}>{'ASCENDING'}</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-4">
                        <div className="form-group">
                            <label className="custom-form-label" htmlFor="limit"><small>Limit</small></label>
                            <select
                                className="custom-form-control"
                                value={params.limit}
                                id="limit"
                                name="limit"
                                onChange={(event) => {
                                    const value = event.target.value || '';
                                    setParam({...params, limit: value});
                                }}>
                                <option defaultValue>Filter By Limit</option>
                                <option value={'10'}>{'10'}</option>
                                <option value={'50'}>{'50'}</option>
                                <option value={'100'}>{'100'}</option>
                                <option value={'500'}>{'500'}</option>
                            </select>
                        </div>
                    </div>
                </div>
                <NavDropdown.Divider/>
                <div className={"text-end"}>
                    <button className={'btn btn-success btn-sm mr-2'} type="submit">Filter</button>
                    <button className="btn btn-warning btn-sm" type="reset" onClick={resetFilterParameter}>Reset
                    </button>
                </div>
            </form>
        </NavDropdown>

    )
        ;
}

export default memo(ExpenseFilter)