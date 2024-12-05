import React, {Fragment, useState, useEffect, useContext, isValidElement, createElement} from 'react';
import {Card, CardContent, Grid, TextField, Button, Typography, Box, ButtonGroup} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';
import MainLoader from '../../components/MainLoader';
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {CardFooter} from "react-bootstrap";
import {notification} from "../../components/ToastNotification.jsx";
import { Modal} from "react-bootstrap";
import { useCreateAssetMutation, useGetSingleAssetDataQuery } from '../../api/slices/assetSlice.js';
import { useGetSectorListDataQuery } from '../../api/slices/sectorSlice.js';
import { useGetBankDataQuery } from '../../api/slices/bankSlice.js';
import { useGetExpenseCategoriesDataQuery } from '../../api/slices/expenseSlice.js';


const initialFormData = {
    id: '',
    sector_id: '',
    account_id: '',
    category_id: '',
    date: '',
};
const initialAssetData = [
    {
        name: '',
        description: '',
        qty: 0,
        unit_price: 0,
        total_price: 0,
        total_used: 0,
        total_damage: 0,
        status: true,
    },
];


export default function AssetForm({ handelCloseModal, id }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false)
    const [assets, setAssets] = useState(initialAssetData);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [categories, setCategories] = useState([]);

// api call
  const {
    data: getSingleAssetData,
    isFetching: singleAssetFetching,
    isError: singleAssetDataError,
  } = useGetSingleAssetDataQuery({ id }, { skip: !id });
  const {
    data: getSectorListData,
    isFetching: sectorListFetching,
    isError: sectorListError,
  } = useGetSectorListDataQuery();
  const {
    data: getBankData,
    isFetching: bankAccListFetching,
    isError: bankAccListError,
  } = useGetBankDataQuery({
    currentPage: "",
    pageSize: 100,
});

  const {
    data: getexpenseCategoriesData,
    isFetching: expenseCategoriesFetching,
    isError: expenseCategoriesDataError,
  } = useGetExpenseCategoriesDataQuery({ id : formData?.sector_id  }, { skip: formData?.sector_id === '' });

  const [createAsset] = useCreateAssetMutation();

    useEffect(() => {
        if (id && getSingleAssetData) {
             setFormData(getSingleAssetData?.data);
             setCategories(getSingleAssetData?.categories);
             setAssets(JSON.parse(getSingleAssetData?.assets));
        }
    }, [getSingleAssetData]);
    useEffect(() => {
        if (getexpenseCategoriesData?.categories) {
             setCategories(getexpenseCategoriesData?.categories);
        }
    }, [getexpenseCategoriesData]);

    useEffect(() => {
        if(getSectorListData?.data){
            setSectors(getSectorListData?.data);
        }
        if(getBankData?.data){
            setBankAccounts(getBankData?.data);
        }
    }, [])

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };
    const handelSectorChange = (e) => {
        setCategories([]);
        setFormData({...formData, sector_id: e.target.value});
    }

    //payment
    const handelAssetDataInputChange = (e, index) => {
        const {name, value} = e.target;
        const updateAssets = [...assets];
        updateAssets[index][name] = value;
        setAssets(updateAssets);
    };
    const handelTotalPrice = (index) => {
        const _thisAsset = assets[index];
        const qty = _thisAsset.qty;
        const unit_price = _thisAsset.unit_price;
        const totalPrice = qty * unit_price;
        const updateAssets = [...assets];

        updateAssets[index]['total_price'] = totalPrice;
        setAssets(updateAssets);
    }

    const addNewAssetRow = () => {
        setAssets([...assets, {
            name: '', description: '', qty: 0, unit_price: 0, total_price: 0, status: '', total_used: 0,
            total_damage: 0
        }]);
    };

    const removeOldAssetRow = (index) => {
        const updateAssets = [...assets];
        updateAssets.splice(index, 1);
        setAssets(updateAssets);
    };


    const submitData = async(e, stay) => {
        e.preventDefault();
        // Handle form submission, e.g., send data to an API
        let _formData = new FormData();
        _formData.append('sector_id', formData.sector_id);
        _formData.append('category_id', formData.category_id);
        _formData.append('account_id', formData.account_id);
        _formData.append('date', formData.date);
        _formData.append('assets', JSON.stringify(assets));
        if (id) {
            _formData.append('id', id);

        }
        const url = id ? `/asset/${id}` : `/asset/add`;
        try {
            const data = await createAsset({ url: url, formData }).unwrap();
            notification("success", data?.message, data?.description);
            if (!stay) {
              handelCloseModal();
            } else {
                setAssets(initialAssetData);
            }
          } catch (err) {
            notification(
              "error",
              err?.message || "An error occurred",
              err?.description || "Please try again later."
            );
          }

    };

    return <>
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
            <span>{id ? "Update" : "Add"} Asset</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <MainLoader loaderVisible={loading}/>
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Sector Information
                </Typography>
                <form>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <label>Sector</label>
                            <select
                                className="form-control mb-3"
                                value={formData.sector_id}
                                name={"sector_id"}
                                onChange={handelSectorChange}>
                                <option defaultValue>{"Select Sector"}</option>
                                {
                                    sectors.length > 0 ? (sectors.map((sector) => (
                                            <option key={sector.value} value={sector.value}>
                                                {sector.label}
                                            </option>)))
                                        :
                                        (<option disabled={true}>{"No Sector was found"}</option>)
                                }
                            </select>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <label>Categories</label>
                            <select
                                className="form-control mb-3"
                                value={formData.category_id}
                                name={"category_id"}
                                onChange={handleInputChange}>
                                <option defaultValue>{"Select Category"}</option>
                                {
                                    categories?.length > 0 ? (categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>))) :
                                        (<option disabled={true}>{"Select TaskModel type First"}</option>)
                                }
                            </select>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <label>Date</label>
                            <input
                                type="date"
                                className="form-control mb-3"
                                name={"date"}
                                value={formData.date}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <label>Expense Account</label>
                            <select
                                className="form-control mb-3"
                                value={formData.account_id}
                                name={"account_id"}
                                onChange={handleInputChange}>
                                <option defaultValue>{"Select Account"}</option>
                                {
                                    bankAccounts.length > 0 ? (bankAccounts.map((account) => (
                                            <option key={account.id} value={account.id}>
                                                {account.bank_name} - {account.account_number}
                                            </option>)))
                                        :
                                        (<option disabled={true}>{"No account was found"}</option>)
                                }
                            </select>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
         <Card style={{marginTop: '20px'}}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Asset Details
                        </Typography>
                        <TableContainer style={{padding: "0px"}}>
                            <Table size={"small"} aria-label={"asset information table"}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align={"center"}><b>{"Name"}</b></TableCell>
                                        <TableCell align={"center"}><b>{"Description"}</b></TableCell>
                                        <TableCell align={"center"}><b>{"Quantity"}</b></TableCell>
                                        <TableCell align={"center"}><b>{"Unit Price"}</b></TableCell>
                                        <TableCell align={"center"}><b>{"Total Price(with vat)"}</b></TableCell>
                                        <TableCell align={"center"}><b>{"Action"}</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>

                                    {assets.map((asset, index) =>
                                        <TableRow key={"asset-" + index}>
                                            <TableCell align={"left"}>
                                                <input
                                                    type="text"
                                                    placeholder={"i.g: Bed"}
                                                    className="form-control"
                                                    name={"name"}
                                                    value={asset.name}
                                                    onChange={(e) => {
                                                        handelAssetDataInputChange(e, index);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align={"left"}>
                                                <input
                                                    type="text"
                                                    placeholder={"i.g: Length: 200C CM"}
                                                    className="form-control"
                                                    name={"description"}
                                                    value={asset.description}
                                                    onChange={(e) => {
                                                        handelAssetDataInputChange(e, index);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align={"left"}>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name={"qty"}
                                                    step={1}
                                                    min={1}
                                                    value={asset.qty}
                                                    onChange={(e) => {
                                                        handelAssetDataInputChange(e, index);
                                                        handelTotalPrice(index);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align={"right"}>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name={"unit_price"}
                                                    min={1}
                                                    value={asset.unit_price}
                                                    onChange={(e) => {
                                                        handelAssetDataInputChange(e, index);
                                                        handelTotalPrice(index);
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align={"right"}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name={"total_price"}
                                                    value={asset.total_price}
                                                    onChange={(e) => handelAssetDataInputChange(e, index)}
                                                />
                                            </TableCell>
                                            <TableCell align={"right"}>
                                                <ButtonGroup variant="contained" aria-label="Basic button group">
                                                    <Button color="primary"
                                                            onClick={addNewAssetRow}>+</Button>
                                                    {index > 0 && (
                                                        <Button color="error"
                                                                onClick={() => removeOldAssetRow(index)}>-</Button>
                                                    )}
                                                </ButtonGroup>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                {errors?.assets &&
                                    <p className="error-message mt-2">{errors?.assets[0]}</p>}
                            </Table>
                        </TableContainer>
                    </CardContent>
                    <CardFooter>
                        <div className={"float-end"}>
                            {
                                formData.id &&
                                <Button variant='contained' sx={{m: 2}}
                                        onClick={(e) => submitData(e, false)}>Update</Button>
                            }{
                            !formData.id &&
                            <>
                                <Button variant='contained' sx={{m: 2}}
                                        onClick={(e) => submitData(e, true)}>Create</Button>
                                <Button variant='contained' sx={{m: 2}} onClick={(e) => submitData(e, false)}>Create &
                                    Exit</Button>
                            </>
                        }
                        </div>
                    </CardFooter>
         </Card>
         </Modal.Body>
      </Modal>
    </>
}

