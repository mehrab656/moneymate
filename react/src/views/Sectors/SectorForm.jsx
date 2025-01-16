import React, { Fragment, useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Box,
  Button,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import {Link, useNavigate, useParams} from "react-router-dom";
import axiosClient from "../../axios-client";
import MainLoader from "../../components/MainLoader";
import { useStateContext } from "../../contexts/ContextProvider.jsx";
import { SettingsContext } from "../../contexts/SettingsContext.jsx";
import { getType } from "@reduxjs/toolkit";
import { Col, Form, Modal, Row } from "react-bootstrap";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";
import { useGetBankDataQuery } from "../../api/slices/bankSlice.js";
import { notification } from "../../components/ToastNotification.jsx";
import {
  useCreateSectorMutation,
  useGetSingleSectorDataQuery,
} from "../../api/slices/sectorSlice.js";
const Periods = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24,
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const initialSectorState = {
  name: "",
  payment_account_id: "",
  contract_start_date: "",
  contract_end_date: "",
  el_premises_no: "",
  el_business_acc_no: "",
  el_acc_no: "",
  el_billing_date: "",
  int_note: "",
  internet_acc_no: "",
  internet_billing_date: "",
  contract_period: 6,
};
const initialPaymentState = [
  {
    paymentNumber: "",
    paymentDate: "",
    amount: "",
  },
];
const initialChannelData = [
  {
    channel_name: "",
    reference_id: "",
    listing_date: "",
  },
];

let categories = [
  "Rent",
  "Electricity",
  "Internet",
  "DTCM",
  "Furniture",
  "Maintenance",
  "Cleaning",
  "Gas",
  "Chiller",
  "Management",
  "Others",
];

function SectorForm({ handelCloseModal, id }) {
  const navigate = useNavigate();
  const { setNotification } = useStateContext();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sector, setSector] = useState(initialSectorState);
  const [paymentData, setPaymentData] = useState(initialPaymentState);
  const [channelData, setChannelData] = useState(initialChannelData);
  const [categoryName, setCategoryName] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);

  const {
    data: getSingleSectorData,
    isFetching: singleCompanyFetching,
    isError: singleCompanyDataError,
  } = useGetSingleSectorDataQuery({ id });
  const {
    data: getBankData,
    isFetching: bankIsFetching,
    isError: bankFetchingDataError,
  } = useGetBankDataQuery({
    currentPage: "",
    pageSize: 100,
  });
  const [createSector] = useCreateSectorMutation();

  useEffect(() => {
    if (getSingleSectorData?.data) {
      setSector(getSingleSectorData?.data);
    }
    if (getBankData?.data.length > 0) {
      setBankAccounts(getBankData?.data);
    }
  }, [getSingleSectorData, getBankData]);

  const handleChangeCategory = (event) => {
    const {
      target: { value },
    } = event;
    setCategoryName(
      // On autofill, we get a stringify value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSector({ ...sector, [name]: value });
  };

  //payment
  const handlePaymentInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedPayments = [...paymentData];
    updatedPayments[index][name] = value;
    setPaymentData(updatedPayments);
  };
  const handleChannelInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedChannel = [...channelData];
    updatedChannel[index][name] = value;
    setChannelData(updatedChannel);
  };

  const handleAddPaymentRow = () => {
    setPaymentData([
      ...paymentData,
      { paymentNumber: "", paymentDate: "", amount: "" },
    ]);
  };
  const handleAddChannelRow = () => {
    setChannelData([
      ...channelData,
      { channel_name: "", reference_id: "", listing_date: "" },
    ]);
  };

  const handleRemovePaymentRow = (index) => {
    const updatedPayments = [...paymentData];
    updatedPayments.splice(index, 1);
    setPaymentData(updatedPayments);
  };
  const handleRemoveChannelRow = (index) => {
    const updatedChannel = [...channelData];
    updatedChannel.splice(index, 1);
    setChannelData(updatedChannel);
  };

  const sectorSubmit = async (e, stay) => {
    e.preventDefault();
    setLoading(true);
    // Handle form submission, e.g., send data to an API
    let formData = new FormData();
    formData.append("name", sector.name);
    formData.append("payment_account_id", sector.payment_account_id);
    formData.append("contract_start_date", sector.contract_start_date);
    formData.append("contract_end_date", sector.contract_end_date);

    //for electricity
    formData.append("el_premises_no", sector.el_premises_no);
    formData.append("el_acc_no", sector.el_acc_no);
    formData.append("el_billing_date", sector.el_billing_date);
    formData.append("el_business_acc_no", sector.el_business_acc_no);

    //for internet
    formData.append("internet_acc_no", sector.internet_acc_no);
    formData.append("internet_billing_date", sector.internet_billing_date);
    formData.append("int_note", sector.int_note);
    if (!id) {
      formData.append("contract_period", sector.contract_period);
    }
    //for payment
    if (!id && paymentData && paymentData.length > 0) {
      paymentData.forEach((element) => {
        formData.append("payment_amount[]", element.amount);
        formData.append("payment_date[]", element.paymentDate);
        formData.append("payment_number[]", element.paymentNumber);
      });
    }
    if (!id && channelData && channelData.length > 0) {
      channelData.forEach((element) => {
        formData.append("channel_name[]", element.channel_name);
        formData.append("reference_id[]", element.reference_id);
        formData.append("listing_date[]", element.listing_date);
      });
    }
    // for category
    if (!id && categoryName && categoryName.length > 0) {
      categoryName.forEach((element) => {
        formData.append("category_name[]", element);
      });
    }
    const url = id ? `/sector/${id}` : `/sector/add`;
    try {
      const data = await createSector({ url: url, formData }).unwrap();
      notification("success", data?.message, data?.description);
      if (!stay) {
        handelCloseModal();
      } else {
        setSector(initialSectorState);
        setPaymentData(initialPaymentState);
      }
    } catch (err) {
      notification(
        "error",
        err?.message || "An error occurred",
        err?.description || "Please try again later."
      );
    }
  };

  return (
    <>
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
            <span>{id ? "Update" : "Add"} Sector</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MainLoader loaderVisible={loading}/>

          <div className="alert alert-warning" role="alert">
            You need to create a bank before add a bank account, if you haven't added a bank yet, <Link
              to="/banks">Click
            Here</Link> to create a bank first.
          </div>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sector Information
              </Typography>
              <form>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        label="Sector Name"
                        variant="outlined"
                        name="name"
                        value={sector.name}
                        onChange={handleInputChange}
                        // focused={true}

                        size="small"
                    />
                    {errors?.name && (
                        <p className="error-message mt-2">{errors.name[0]}</p>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        label="Contract Start Date"
                        type="date"
                        variant="outlined"
                        name="contract_start_date"
                        value={sector.contract_start_date}
                        onChange={handleInputChange}
                        // focused={true}
                        InputLabelProps={{shrink: true}}
                        size="small"
                    />
                    {errors?.contract_start_date && (
                        <p className="error-message mt-2">
                          {errors?.contract_start_date[0]}
                        </p>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        label="Contract End Date"
                        type="date"
                        variant="outlined"
                        name="contract_end_date"
                        value={sector.contract_end_date}
                        onChange={handleInputChange}
                        InputLabelProps={{shrink: true}}
                        // focused={true}
                        size="small"
                    />
                    {errors?.contract_end_date && (
                        <p className="error-message mt-2">
                          {errors?.contract_end_date[0]}
                        </p>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{minWidth: 120}}>
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">
                          Payment Account
                        </InputLabel>
                        <Select
                            // focused={true}
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            name="payment_account_id"
                            value={sector.payment_account_id}
                            label="Payment Account"
                            onChange={handleInputChange}
                            size="small"
                        >
                          {bankAccounts.map((account, i) => {
                            return (
                                <MenuItem key={account.id + i} value={account.id}>
                                  {account.bank_name} - {account.account_number}
                                </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Box>
                    {errors?.contract_end_date && (
                        <p className="error-message mt-2">
                          {errors?.contract_end_date[0]}
                        </p>
                    )}
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>

          <Card style={{marginTop: "20px"}}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Electricity
              </Typography>
              <form>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        label="DEWA"
                        type="number"
                        variant="outlined"
                        name="el_premises_no"
                        value={sector.el_premises_no}
                        onChange={(ev) =>
                            setSector({
                              ...sector,
                              el_premises_no: ev.target.value,
                            })
                        }
                        // focused={true}
                        size="small"
                    />
                    {errors?.el_premises_no && (
                        <p className="error-message mt-2">
                          {errors?.el_premises_no[0]}
                        </p>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        label="Business Account No"
                        type="number"
                        variant="outlined"
                        name="el_business_acc_no"
                        value={sector.el_business_acc_no}
                        onChange={(ev) =>
                            setSector({
                              ...sector,
                              el_business_acc_no: ev.target.value,
                            })
                        }
                        // focused={true}
                        size="small"
                    />
                    {errors?.el_business_acc_no && (
                        <p className="error-message mt-2">
                          {errors?.el_business_acc_no[0]}
                        </p>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        label="Account Number"
                        variant="outlined"
                        type="number"
                        name="el_acc_no"
                        value={sector.el_acc_no}
                        onChange={(ev) =>
                            setSector({...sector, el_acc_no: ev.target.value})
                        }
                        // focused={true}
                        size="small"
                    />
                    {errors?.el_acc_no && (
                        <p className="error-message mt-2">
                          {errors?.el_acc_no[0]}
                        </p>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                        fullWidth
                        // focused={true}
                        label="Billing Date"
                        type="date"
                        variant="outlined"
                        name="el_billing_date"
                        value={sector.el_billing_date}
                        onChange={(ev) =>
                            setSector({
                              ...sector,
                              el_billing_date: ev.target.value,
                            })
                        }
                        InputLabelProps={{shrink: true}}
                        size="small"
                    />
                    {errors?.el_billing_date && (
                        <p className="error-message mt-2">
                          {errors?.el_billing_date[0]}
                        </p>
                    )}
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>

          <Card style={{marginTop: "20px"}}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Internet
              </Typography>
              <form>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={!sector.id ? 3 : 4}>
                    <TextField
                        fullWidth
                        label="Account Number"
                        variant="outlined"
                        name="internet_acc_no"
                        type="text"
                        value={sector.internet_acc_no}
                        onChange={(ev) =>
                            setSector({
                              ...sector,
                              internet_acc_no: ev.target.value,
                            })
                        }
                        // focused={true}
                        size="small"
                    />
                    {errors?.internet_acc_no && (
                        <p className="error-message mt-2">
                          {errors?.internet_acc_no[0]}
                        </p>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={!sector.id ? 3 : 4}>
                    <TextField
                        fullWidth
                        label="Billing Date"
                        type="date"
                        variant="outlined"
                        name="internet_billing_date"
                        value={sector.internet_billing_date}
                        onChange={(ev) =>
                            setSector({
                              ...sector,
                              internet_billing_date: ev.target.value,
                            })
                        }
                        InputLabelProps={{shrink: true}}
                        // focused={true}
                        size="small"
                    />
                  </Grid>
                  {!sector.id && (
                      <Grid item xs={12} sm={3}>
                        <Box sx={{minWidth: 120}}>
                          <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                              Contract period
                            </InputLabel>
                            <Select
                                // // focused={true}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                name="contract_period"
                                // focused={true}
                                value={sector.contract_period}
                                label="Contract period"
                                onChange={(ev) =>
                                    setSector({
                                      ...sector,
                                      contract_period: ev.target.value,
                                    })
                                }
                                size="small"
                            >
                              {Periods.map((time) => {
                                return (
                                    <MenuItem key={time} value={time}>
                                      {time}
                                    </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>
                        </Box>
                        {errors?.contract_period && (
                            <p className="error-message mt-2">
                              {errors?.contract_period[0]}
                            </p>
                        )}
                      </Grid>
                  )}

                  <Grid item xs={12} sm={!sector.id ? 3 : 4}>
                    <TextField
                        fullWidth
                        label="Note"
                        variant="outlined"
                        name="note"
                        value={sector.int_note}
                        onChange={(ev) =>
                            setSector({...sector, int_note: ev.target.value})
                        }
                        // focused={true}
                        size="small"
                    />
                    {errors?.int_note && (
                        <p className="error-message mt-2">
                          {errors?.int_note[0]}
                        </p>
                    )}
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
          {!sector.id && (
              <>
                <Card style={{marginTop: "20px"}}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Payment
                    </Typography>
                    {paymentData.map((payment, index) => (
                        <Grid container spacing={2} key={index} sx={{mb: 2}}>
                          <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Payment Number"
                                variant="outlined"
                                name="paymentNumber"
                                value={payment.paymentNumber}
                                onChange={(e) => handlePaymentInputChange(e, index)}
                                // focused={true}
                                size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Payment Date"
                                type="date"
                                variant="outlined"
                                name="paymentDate"
                                value={payment.paymentDate}
                                onChange={(e) => handlePaymentInputChange(e, index)}
                                InputLabelProps={{shrink: true}}
                                // focused={true}
                                size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Amount"
                                variant="outlined"
                                name="amount"
                                type="number"
                                value={payment.amount}
                                onChange={(e) => handlePaymentInputChange(e, index)}
                                // focused={true}
                                size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <AddBoxIcon
                                sx={{ml: 2, mt: 1}}
                                onClick={handleAddPaymentRow}
                            />
                            {index > 0 && (
                                <DoDisturbOnIcon
                                    sx={{ml: 2, mt: 1}}
                                    onClick={() => handleRemovePaymentRow(index)}
                                />
                            )}
                          </Grid>
                        </Grid>
                    ))}
                  </CardContent>
                </Card>

                <Card style={{marginTop: "20px"}}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Associative Categories
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="demo-multiple-checkbox-label">
                        Associative Categories
                      </InputLabel>
                      <Select
                          labelId="demo-multiple-checkbox-label"
                          id="demo-multiple-checkbox"
                          multiple
                          value={categoryName}
                          onChange={handleChangeCategory}
                          input={<OutlinedInput label=" Associative Categories"/>}
                          renderValue={(selected) => selected.join(", ")}
                          MenuProps={MenuProps}
                          style={{backgroundColor: "#eeeeee"}}
                          // focused={true}
                          size="small"
                      >
                        {categories.map((name) => (
                            <MenuItem key={name} value={name}>
                              <Checkbox checked={categoryName.indexOf(name) > -1}/>
                              <ListItemText primary={name}/>
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>

                <Card style={{marginTop: "20px"}}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Channel References
                    </Typography>
                    {channelData.map((channel, index) => (
                        <Grid container spacing={2} key={index} sx={{mb: 2}}>
                          <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Channel Name"
                                variant="outlined"
                                name="channel_name"
                                value={channel.channel_name}
                                onChange={(e) => handleChannelInputChange(e, index)}
                                // focused={true}
                                size="small"
                            />
                          </Grid>
                          {/*//Need this*/}
                          {/*<Grid item xs={12} sm={3}>*/}
                          {/*    <Box sx={{minWidth: 120}}>*/}
                          {/*        <FormControl fullWidth>*/}
                          {/*            <InputLabel id="channel-name">Channel Name</InputLabel>*/}
                          {/*            <Select*/}
                          {/*                // // focused={true}*/}
                          {/*                labelId="channel-name"*/}
                          {/*                id="channel-name"*/}
                          {/*                name="channel_name"*/}
                          {/*                // focused={true}*/}
                          {/*                value={channel.channel_name}*/}
                          {/*                label="Contract period"*/}
                          {/*                // onChange={ev => setChannelData({...channelData, channel_name: ev.target.value})}*/}
                          {/*            >*/}
                          {/*                {Channels.map(name => {*/}
                          {/*                    return <MenuItem key={name} value={name}>{name}</MenuItem>;*/}
                          {/*                })}*/}
                          {/*            </Select>*/}
                          {/*        </FormControl>*/}
                          {/*    </Box>*/}
                          {/*</Grid>*/}

                          <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Reference ID"
                                variant="outlined"
                                name="reference_id"
                                value={channel.reference_id}
                                onChange={(e) => handleChannelInputChange(e, index)}
                                InputLabelProps={{shrink: true}}
                                // focused={true}
                                size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <TextField
                                fullWidth
                                label="Amount"
                                variant="outlined"
                                name="listing_date"
                                type="date"
                                value={channel.listing_date}
                                onChange={(e) => handleChannelInputChange(e, index)}
                                // focused={true}
                                InputLabelProps={{shrink: true}}
                                size="small"
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <AddBoxIcon
                                sx={{ml: 2, mt: 1}}
                                onClick={handleAddChannelRow}
                            />
                            {index > 0 && (
                                <DoDisturbOnIcon
                                    sx={{ml: 2, mt: 1}}
                                    onClick={() => handleRemoveChannelRow(index)}
                                />
                            )}
                          </Grid>
                        </Grid>
                    ))}
                  </CardContent>
                </Card>
              </>
          )}

          <Box
              display="flex"
              justifyContent="center"
              justifyItems="center"
              sx={{mt: 5, mb: 5}}
          >
            {sector.id && (
                <Button
                    variant="contained"
                    sx={{m: 2}}
                    onClick={(e) => sectorSubmit(e, false)}
                >
                  Update
                </Button>
            )}
            {!sector.id && (
                <>
                  <Button
                      variant="contained"
                      sx={{m: 2}}
                      onClick={(e) => sectorSubmit(e, true)}
                  >
                    Create
                  </Button>
                  <Button
                      variant="contained"
                      sx={{m: 2}}
                      onClick={(e) => sectorSubmit(e, false)}
                  >
                    Create & Exit
                  </Button>
                </>
            )}
          </Box>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default SectorForm;
