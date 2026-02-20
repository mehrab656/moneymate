import {Col, Container, Modal, Row} from "react-bootstrap";
import React, {useEffect, useRef, useState} from "react";
import {useGetCategoryListDataQuery} from "../../../../api/slices/categorySlice.js";
import {notification} from "../../../../components/ToastNotification.jsx";
import {
    useUploadCsvMutation,
} from "../../../../api/slices/incomeSlice.js";
import Papa from "papaparse"
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {Box, Button, CircularProgress} from "@mui/material";
import Select from "react-select";
import {createSelectStyles} from "../../../../styles/formThemeStyles.js";
import {useTheme} from "@mui/material/styles";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRotateRight, faFilter} from "@fortawesome/free-solid-svg-icons";
import FilteredParameters from "../../Expense/Components/FilteredParameters.jsx";

const _initialData = {
    fileName:'',
    file:null,
    category:{
        name:'',
        value:''
    },
    channel:''
}
export default function CsvFileUpload({handelCloseModal}) {

    const [csvData, setCsvData] = useState(_initialData);
    const [categories, setCategories] = useState([]);
    const fileInputRef = useRef(null);
    const [incomeHeaders, setIncomeHeaders] = useState([]); // array of header strings
    const [incomeRows, setIncomeRows] = useState([]);       // array of objects
    const [showLoading, setShowLoading] = useState(false)
    const theme = useTheme();

    const inputFontSize = "0.875rem";
    const selectStyles = createSelectStyles(theme, inputFontSize);


    const {
        data: getCategoryListData,
        isFetching: categoryIsFetching,
    } = useGetCategoryListDataQuery({
        categoryType: 'income'
    });

    useEffect(() => {
        if (getCategoryListData?.data.length > 0) {
            setCategories(getCategoryListData?.data);
        }
    }, [ getCategoryListData]);
    const handelChangeInput = (e) => {
        const {name,value} = e.target

        setCsvData((prev) => ({ ...prev, [name]: value }));
        // Clear error for the field being edited
    };
    const handelCategoryChange =(e)=> {
        setCsvData({...csvData,category:e})
    }

    useEffect(()=>{

    },[incomeRows]);

    const [uploadCSV] = useUploadCsvMutation();

    const handleFileInput = () =>{
        fileInputRef.current.click();
    }
    const uploadFile = (e)=>{
        const file = e.target.files[0];
        if (!file) return;
        setShowLoading(true);

        const fileName = file.name.length>12
        ? `${file.name.substring(0,13)}... .${file.name.split('.')[1]}`
            :file.name;

        const isCSVMime = file.type === "text/csv" || file.type==="application/vnd.ms-excel";
        const isCsvExtension = file.name.toLowerCase().endsWith('.csv');

        if (!isCsvExtension && !isCSVMime){
            notification("warning", "Invalid File", "Please Upload a valid CSV file");
            e.target.value = null;
            return;
        }


        const formData = new FormData();
        formData.append('file',file);
        // @fixme in future for multiple file upload
        // setFiles(prevState => [...prevState,{name:fileName,loading:0}]);
        setCsvData((prevState)=>({
            ...prevState, fileName: fileName, file:file
        }));

        Papa.parse(file, {
            header: true,           // uses first row as headers
            skipEmptyLines: true,
            transformHeader: (h) => h.trim().toLowerCase(),
            complete: (results) => {
                const parseRows = (results.data || []).map((r,idx)=>({
                    ...r,
                    _rowID: `${Date.now()}-${idx}`, //unique id for react + updates
                    _status:"pending", //pending | uploading | uploaded |failed
                    _message:"", // error message optional.
                }));
                setIncomeHeaders([...(results.meta.fields || []),"_status"]); //an extra column for status show
                setIncomeRows(parseRows);
                setShowLoading(false);
            },
            error: (err) => {
                console.error("CSV Parse Error:", err);
                setShowLoading(false)
            },
        });
    }
    const updateRowStatus = (rowID, status, message = "") => {
        setIncomeRows(prev =>
            prev.map(r =>
                r._rowID === rowID ? { ...r, _status: status, _message: message } : r
            )
        );
    };

    const submitCSVFile = async (e,rowID = null) => {
        e.preventDefault();
        setShowLoading(true);

        let csvFormData = new FormData();
        csvFormData.append("channel", csvData.channel);
        csvFormData.append("csvFile", csvData.file);
        csvFormData.append("category_id", csvData.category.value);

        const rowsToBeUploaded = rowID
        ? incomeRows.filter((r)=>r._rowID === rowID)
            : incomeRows;

        for (const row of rowsToBeUploaded){
            if (row._status === "uploaded") continue;

            updateRowStatus(row._rowID,"uploading");
            try {
                const payload = {...row};
                delete payload._status;
                delete payload._message;

                payload.channel = csvData.channel;
                payload.category_id=csvData.category.value;

                 await uploadCSV({
                    url: '/income/add-csv', formData:payload
                }).unwrap();

                updateRowStatus(row._rowID, "uploaded");

            } catch (err) {
                updateRowStatus(row._rowID, "failed",
                err?.response?.data?.message || err.message || "Upload failed");
            }
        }
    }

    const resetModal = ()=>{
        setCsvData(_initialData);
        setIncomeHeaders([]);
        setIncomeRows([])
        setShowLoading(false);
    }


    return (<>
            <Modal show={true} centered onHide={handelCloseModal} backdrop="static"
                   keyboard={false}
                   size={"lg"}>
                <Modal.Header closeButton className={'file-input-modal-header'}>
                    <Modal.Title>
                        <span>Add new Income</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={'file-input-modal-body'}>

                    <Container>
                        <Row>
                            <Col sm={8}>
                                <TableContainer sx={{ maxHeight: { xs: 'none', md: 440 }, overflowX: 'auto', flexGrow: 1 }}>
                                    <Table stickyHeader aria-label="sticky table" size="small">
                                        <TableHead>
                                            <TableRow>

                                                {
                                                    incomeHeaders.map(h=>(
                                                        <TableCell
                                                            key={`sticky-header-table${h}`}>
                                                            {h.toUpperCase().replace('_','')}
                                                        </TableCell>
                                                    ))}

                                                    {/*<TableCell>Status</TableCell>*/}

                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {incomeRows.map((income) => {
                                                    return (
                                                        <TableRow hover role="checkbox" tabIndex={-1} key={Math.random().toString(36).substring(2)}>
                                                            {
                                                                incomeHeaders.filter(h=> h!=="_status").map((h)=>(
                                                                    <TableCell key={h}>
                                                                        {income[h]}
                                                                    </TableCell>
                                                                ))}
                                                            <TableCell>{
                                                                income._status ==='failed'?
                                                                    <Box display="flex" alignItems="center">
                                                                        <button
                                                                            className={"btn primary-theme-btn btn-xs mr-2"}
                                                                            onClick={(e)=>{submitCSVFile(e,income._rowID)}}
                                                                        >
                                                                            <FontAwesomeIcon icon={faArrowRotateRight} />
                                                                            {" Retry"}
                                                                        </button>
                                                                    </Box>
                                                                    :
                                                                    income._status

                                                            }</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Col>
                            <Col sm={4}>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="channel">
                                        Channel
                                    </label>
                                    <select
                                        className="form-control"
                                        name="channel"
                                        value={csvData.channel}
                                        onChange={handelChangeInput}
                                    >
                                        <option defaultValue>Select Channel</option>
                                        <option value="airbnb">Airbnb</option>
                                        <option value="booking">Booking.com</option>
                                        <option value="expedia">Expedia</option>
                                        <option value="vrbo">VRBO</option>
                                        <option value="google">Google Vacation Rental</option>
                                        <option value="others">Others</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="custom-form-label" htmlFor="channel">
                                        Categories
                                    </label>
                                    <div style={{flex: 1}}>
                                        <Select
                                            classNamePrefix="select"
                                            value={csvData.category}
                                            isSearchable={false}
                                            name="category"
                                            isLoading={categoryIsFetching}
                                            options={categories}
                                            styles={selectStyles}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            placeholder={"Select Category"}
                                            onChange={handelCategoryChange}
                                        />
                                    </div>
                                </div>
                                <div className="upload-box">
                                    <form className="custom-form">
                                        <input
                                            className='file-input'
                                            type='file'
                                            name={'file'}
                                            hidden={true}
                                            ref={fileInputRef}
                                            onChange={uploadFile}
                                        />
                                        <div className={'icon'} onClick={handleFileInput}>
                                        <img src={'upload-file.svg'} alt={'csv file'}/>
                                        </div>
                                    </form>
                                    <section className={'loading-area'}>
                                        <li className={'row file-progress-area'}>
                                            <div className={'content'}>
                                                <div className={'details'}>
                                                    <div className={'name'}>
                                                        {csvData.fileName}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    </section>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer className={'file-input-modal-footer'}>
                    <div className={'footer-buttons'}>
                        <Button className="primary-theme-btn btn-sm load"
                                variant="contained"
                                component={'span'}
                                disabled={showLoading}
                                startIcon={showLoading?<CircularProgress size={18} />:null }

                                onClick={submitCSVFile}>
                            {"Upload CSV"}
                        </Button>
                        <Button className="btn-danger btn-sm"
                                variant="secondary"
                                component={'span'}
                                onClick={resetModal}>
                            {"Clear All"}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    )
}
