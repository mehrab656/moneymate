<div className="table-responsive-sm">
                        <table className="table table-bordered custom-table">
                            <thead>
                            <tr className={'text-center'}>
                                <th>Expense Date</th>
                                <th>Expense Category</th>
                                <th>Description</th>
                                <th>Expense Amount</th>
                            </tr>
                            </thead>
                            {loading && (
                                <tbody>
                                <tr className={'text-center'}>
                                    <td colSpan={4} className="text-center">
                                        Loading...
                                    </td>
                                </tr>
                                </tbody>
                            )}
                            {!loading && (
                                <tbody>
                                {expenseReport.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            Nothing found !
                                        </td>
                                    </tr>
                                ) : (
                                    expenseReport.map((expense, index) => (
                                        <tr key={expense.id} className={'text-start'}>
                                            <td>{expense.date}</td>
                                            <td>{expense.category_name}</td>
                                            <td>{expense.description}
                                                <a onClick={() => showExpenseDetails(expense, index)}
                                                   className={index === activeModal ? 'text-primary fa-pull-right ' : 'text-muted fa-pull-right'}
                                                   data-tooltip-id='expense-details'
                                                   data-tooltip-content={"View details"}>
                                                    <span className="aside-menu-icon">
                                                        <FontAwesomeIcon
                                                            icon={index === activeModal ? faEye : faEyeSlash}/>
                                                    </span>
                                                </a>
                                                <Tooltip id={"expense-details"}/>
                                            </td>
                                            <td className={'text-end'}>{default_currency + ' ' + expense.amount}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            )}
                            <tfoot>
                            <tr>
                                <td className={'text-center fw-bold'} colSpan={2}>Total Expense</td>
                                <td className={'text-end fw-bold'}
                                    colSpan={2}>{default_currency + ' ' + totalExpense}</td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                    {/*container*/}
                    {totalPages > 1 && (
                        <Pagination>
                            <Pagination.Prev
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            />
                            {paginationItems}
                            <Pagination.Next
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            />
                        </Pagination>
                    )}