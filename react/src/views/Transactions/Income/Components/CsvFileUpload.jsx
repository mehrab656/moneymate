import {Col, Container, Modal, Row} from "react-bootstrap";
import React, {useEffect, useRef, useState} from "react";
import {useGetCategoryListDataQuery} from "../../../../api/slices/categorySlice.js";
import Button from "react-bootstrap/Button";
import {notification} from "../../../../components/ToastNotification.jsx";
import {
    useUploadCsvMutation,
} from "../../../../api/slices/incomeSlice.js";
import {faFileAlt, faSquareCheck} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

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
    const [csvBtnTxt, setCsvBtnText] = useState("Upload");
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showProgress, setShowProgress] = useState([]);
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

    const [uploadCSV] = useUploadCsvMutation();
    const submitCSVFile = async (e) => {
        e.preventDefault();
        // e.currentTarget.disabled = true;
        setCsvBtnText("Uploading...");
        let csvFormData = new FormData();
        csvFormData.append("channel", channel);
        csvFormData.append("csvFile", csvFile);
        csvFormData.append("category_id", channel === 'booking' ? csvCategoryValue.id : 0);


        try {
            const data = await uploadCSV({
                url: '/income/add-csv', formData: {
                    channel: channel,
                    csvFile: csvFile,
                    category_id: csvCategoryValue.value
                }
            }).unwrap();
            console.log(data);
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
        setCsvBtnText("Upload");
    }

    const handleFileInput = () =>{
        fileInputRef.current.click();
    }
    const uploadFile = (e)=>{
        const file = e.target.files[0];
        if (!file) return;

        const fileName = file.name.length>12
        ? `${file.name.substring(0,13)}... .${file.name.split('.')[1]}`
            :file.name;

        const formData = new FormData();
        formData.append('file',file);
        setFiles(prevState => [...prevState,{name:fileName,loading:0}]);

        setShowProgress(true);

    }
    return (<>
            <Modal show={true} centered onHide={handelCloseModal} backdrop="static"
                   keyboard={false}
                   size={"lg"}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span>Add new Income</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Container>
                        <Row>
                            <Col sm={8}>sm=8</Col>
                            <Col sm={4}>
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
                                            <img src={'upload-file.svg'}/>
                                        </div>
                                    </form>
                                    {
                                        showProgress && (
                                            <section className={'loading-area'}>
                                                {
                                                    files.map((file,index)=> (
                                                        <li className={'row'} key={index}>
                                                            <div className={'content'}>
                                                                <div className={'details'}>
                                                                    <div className={'name'}>
                                                                        {`${file.name} - uploading`}
                                                                    </div>
                                                                    <div className={'percent'}>
                                                                        {`${file.loading}%`}
                                                                    </div>
                                                                    <div className={'loading-bar'}>
                                                                        <div className={'loading'} style={{width: `${file.loading}%`}}></div>
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
                                            uploadedFiles.map((file,index)=> (
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
                <Modal.Footer>
                    <Button className="btn-sm load" variant="primary"
                            onClick={submitCSVFile}>
                        {csvBtnTxt}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}