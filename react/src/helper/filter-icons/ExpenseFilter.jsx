import NavDropdown from "react-bootstrap/NavDropdown";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFilter} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import React, {memo} from "react";
import {Row} from "react-bootstrap";

const ExpenseFilter = ({
                           handleSubmit,
                           selectedSectorId,
                           setSelectedSectorId,
                           sectors,
                           selectedCategoryId,
                           setSelectedCategoryId,
                           expenseCategories,
                           startDate,
                           setStartDate,
                           endDate,
                           setEndDate,
                           searchParoms,
                           setSearchParoms,
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
                        value={selectedSectorId}
                        id="sector"
                        name="sector"
                        onChange={(event) => {
                            const value = event.target.value || '';
                            setSelectedSectorId(value);
                        }}>
                        <option defaultValue>Filter By Sectors</option>
                        {sectors.map(sector => (
                            <option key={"sec-" + sector.id} value={sector.id}>
                                {sector.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="custom-form-label" htmlFor="expense_category"><small>Filter by Expense
                        Category</small></label>
                    <select
                        className="custom-form-control"
                        value={selectedCategoryId}
                        id="expense-category"
                        name="expense-category"
                        onChange={(event) => {
                            const value = event.target.value || '';
                            setSelectedCategoryId(value);
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
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
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
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
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
                        value={searchParoms}
                        onChange={(ev) =>
                            setSearchParoms(ev.target.value)
                        }
                    />
                </div>
                <NavDropdown.Divider/>
                <div className={"text-end"}>
                    <button className={'btn btn-success btn-sm mr-2'} type="submit">Filter</button>
                    <button className="btn btn-warning btn-sm" type="reset" onClick={resetFilterParameter}>Reset</button>
                </div>
            </form>
        </NavDropdown>

    )
        ;
}

export default memo(ExpenseFilter)