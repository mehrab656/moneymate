import {Col, Container, Modal, Row} from "react-bootstrap";
import React, {useEffect, useRef, useState} from "react";
import {useGetCategoryListDataQuery} from "../../../../api/slices/categorySlice.js";
import {notification} from "../../../../components/ToastNotification.jsx";
import {
    useUploadCsvMutation,
} from "../../../../api/slices/incomeSlice.js";
import {faFileAlt, faSquareCheck} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Papa from "papaparse"
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { Button, CircularProgress, Box } from "@mui/material";

const defaultData = {
    account: [],
    category: [],
    income_type: [],
    reference: [],
    amount: "", // Set default value to an empty string
    description: "",
    date: "",
    checkin_date: "",
    checkout_date: "",
    deposit: "",
    note: "",
    attachment: "",
}

export default function CsvFileUpload({handelCloseModal}) {


    const [income, setIncome] = useState(defaultData);
    const [categories, setCategories] = useState([]);
    const [csvCategoryValue, setCsvCategoryValue] = useState("");
    const [channel, setChannel] = useState('airbnb')
    const [csvFile, setCSVFile] = useState({});
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showProgress, setShowProgress] = useState(false);
    const [buttonText, setButtonText]  = useState('Select CSV');
    const [incomeHeaders, setIncomeHeaders] = useState([]); // array of header strings
    const [incomeRows, setIncomeRows] = useState([]);       // array of objects
    const [showLoading, setShowLoading] = useState(false)
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
    const handleChangeToggle = (event) => {
        setChannel(event.target.value);
    };

    useEffect(()=>{

    },[incomeRows]);

    const [uploadCSV] = useUploadCsvMutation();
    const submitCSVFile = async (e) => {
        e.preventDefault();
        // e.currentTarget.disabled = true;
        setButtonText("Uploading...");
        let csvFormData = new FormData();
        csvFormData.append("channel", channel);
        csvFormData.append("csvFile", files);
        csvFormData.append("category_id", channel === 'booking' ? csvCategoryValue.id : 0);

        try {
            const data = await uploadCSV({
                url: '/income/add-csv', formData: {
                    channel: channel,
                    csvFile: files,
                    category_id: csvCategoryValue.value
                }
            }).unwrap();
            // notification("success", data?.message, data?.description);

            // handelCloseModal();
        } catch (err) {
            if (err.status === 406) {
                setShowExistingTask(true);
                setExistingTask(err?.errorData?.data);
            } else if (err.status === 422) {
                notification("error", err?.message);
            } else {
                notification(
                    "error",
                    err?.message || "An error occurred",
                    err?.description || "Please try again later."
                );
            }
        }
        setButtonText("Upload");
    }

    const handleFileInput = () =>{
        fileInputRef.current.click();
    }
    const uploadFile = (e)=>{
        const file = e.target.files[0];
        if (!file) return;
        setShowLoading(true);
        setShowProgress(true);

        const fileName = file.name.length>12
        ? `${file.name.substring(0,13)}... .${file.name.split('.')[1]}`
            :file.name;
        const formData = new FormData();
        formData.append('file',file);
        setFiles(prevState => [...prevState,{name:fileName,loading:0}]);
        Papa.parse(file, {
            header: true,           // uses first row as headers
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),
            complete: (results) => {
               setTimeout(()=>{
                   setIncomeHeaders(results.meta.fields || []);
                   setIncomeRows(results.data || []);

                   setShowLoading(false)
               },1200)
            },
            error: (err) => {
                console.error("CSV Parse Error:", err);
                setShowLoading(false)
            },
        });

    }
    const handleChange = (e) => {
        setChannel(e.target.value)
    };
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
                                                {incomeHeaders.map((column,index) => (
                                                    <TableCell
                                                        key={`sticky-header-table${index}`}>
                                                        {column}
                                                    </TableCell>
                                                ))}
                                                {/*its needed to show the progress*/}
                                                {/*<TableCell*/}
                                                {/*    key={"action"}*/}
                                                {/*    align={"left"}*/}
                                                {/*    style={{ minWidth: "170" }}*/}
                                                {/*>*/}
                                                {/*    {"Actions"}*/}
                                                {/*</TableCell>*/}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {incomeRows.map((income,index) => {
                                                    return (
                                                        <TableRow hover role="checkbox" tabIndex={-1} key={Math.random().toString(36).substring(2)}>
                                                            {
                                                                incomeHeaders.map((header)=>(
                                                                    <TableCell key={header}>
                                                                        {income[header]}
                                                                    </TableCell>
                                                                ))
                                                            }
                                                            {/*<TableCell>*/}
                                                            {/*    <ActionButtonHelpers*/}
                                                            {/*        actionBtn={actionButtons}*/}
                                                            {/*        element={data}/>*/}
                                                            {/*</TableCell>*/}
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
                                        value={channel}
                                        onChange={handleChange}
                                    >
                                        <option value="airbnb">Airbnb</option>
                                        <option value="booking">Booking.com</option>
                                        <option value="expedia">Expedia</option>
                                        <option value="vrbo">VRBO</option>
                                        <option value="others">Others</option>
                                    </select>
                                </div>
                                <div className="upload-box">
                                    <p>Upload your file</p>
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
                                    {
                                        showProgress && (
                                            <section className={'loading-area'}>
                                                {
                                                    files.map((file, index) => (
                                                        <li className={'row file-progress-area'} key={index}>
                                                            <div className={'content'}>
                                                                <div className={'details'}>
                                                                    <div className={'name'}>
                                                                        {`${file.name} - uploading`}
                                                                    </div>
                                                                    <div className={'percent'}>
                                                                        {`${file.loading}%`}
                                                                    </div>
                                                                    <div className={'loading-bar'}>
                                                                        <div className={'loading'}
                                                                             style={{width: `${file.loading}%`}}></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))
                                                }

                                            </section>
                                        )
                                    }

                                    <section className={'upload-area'}>
                                        {
                                            uploadedFiles.map((file, index) => (
                                                <li className={'row'} key={index}>
                                                    <div className={"content upload"}>
                                                        <div className={'details'}>
                                                            <span className={'name'}>{file.name}</span>
                                                            <span className={'size'}>{file.size}</span>
                                                        </div>
                                                    </div>
                                                    <FontAwesomeIcon className={'fileIcon'} icon={faFileAlt}/>
                                                </li>
                                            ))
                                        }

                                    </section>
                                </div>
                            </Col>
                        </Row>
                    </Container>

                    {/*<form className="custom-form">*/}
                    {/*    <div className="form-group">*/}
                    {/*        <label className='custom-form-label' htmlFor='csv_file'>*/}
                    {/*            Upload CSV file*/}
                    {/*        </label>*/}
                    {/*        <input*/}
                    {/*            className='custom-form-control'*/}
                    {/*            type='file'*/}
                    {/*            id={"csv_file"}*/}
                    {/*            onChange={handelCSVFileInputChange}*/}
                    {/*            placeholder='Attach CSV file here'*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*    <div className={"form-control"}>*/}
                    {/*        <FormControl>*/}
                    {/*            <FormLabel id="demo-controlled-radio-buttons-group">Channels</FormLabel>*/}
                    {/*            <RadioGroup*/}
                    {/*                aria-labelledby="demo-controlled-radio-buttons-group"*/}
                    {/*                name="controlled-radio-buttons-group"*/}
                    {/*                value={channel}*/}
                    {/*                onChange={handleChangeToggle}*/}
                    {/*            >*/}
                    {/*                <Box display={'flex'}>*/}
                    {/*                    <FormControlLabel value="airbnb" control={<Radio/>} label="Airbnb"/>*/}
                    {/*                    <FormControlLabel value="booking" control={<Radio/>}*/}
                    {/*                                      label="Booking.com"/>*/}
                    {/*                    <FormControlLabel value="vrbo" control={<Radio/>} label="VRBO"/>*/}
                    {/*                    <FormControlLabel value="experia" control={<Radio/>}*/}
                    {/*                                      label="Expedia"/>*/}
                    {/*                </Box>*/}
                    {/*            </RadioGroup>*/}
                    {/*        </FormControl></div>*/}

                    {/*    <div className=''>*/}
                    {/*        <Form.Group className="mb-1" controlId="category_id">*/}
                    {/*            <Form.Label style={{marginBottom: '0px'}}*/}
                    {/*                        className="custom-form-label">Category</Form.Label>*/}
                    {/*            <Select*/}
                    {/*                className="basic-single"*/}
                    {/*                classNamePrefix="select"*/}
                    {/*                value={csvCategoryValue}*/}
                    {/*                isSearchable={true}*/}
                    {/*                name="category_id"*/}
                    {/*                isLoading={categoryIsFetching}*/}
                    {/*                options={categories}*/}
                    {/*                onChange={(event) => {*/}
                    {/*                    setCsvCategoryValue(event)*/}
                    {/*                }}*/}
                    {/*            />*/}
                    {/*        </Form.Group>*/}
                    {/*    </div>*/}
                    {/*</form>*/}
                    {/*<ProgressBar striped variant={"success"} now={csvProgressStatus} label={`${csvProgressStatus}%`}/>*/}
                </Modal.Body>
                <Modal.Footer className={'file-input-modal-footer'}>
                    <Button className="primary-theme-btn btn-sm load"
                            variant="contained"
                            component={'span'}
                            disabled={showLoading}
                            startIcon={showLoading?<CircularProgress size={18} />:null }

                            onClick={submitCSVFile}>
                        {showLoading ? "Analyzing..." : "Upload CSV"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
