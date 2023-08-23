import {Link} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import Swal from "sweetalert2";
import axiosClient from "../axios-client.js";
import { SettingsContext } from "../contexts/SettingsContext.jsx";

export default function Wallets() {

    const [loading, setLoading] = useState(false);
    const [wallets, setWallets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const {applicationSettings, userRole} = useContext(SettingsContext);

    const filteredWallets = wallets.filter(
        (wallet) =>
            wallet.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onDelete = (wallet) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You will not be able to recover ${wallet.name}!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosClient
                    .delete(`wallets/${wallet.id}`)
                    .then(() => {
                        getCategories(currentPage, pageSize);
                        Swal.fire({
                            title: "Deleted!",
                            text: "Wallet has been deleted.",
                            icon: "success",
                        });
                    })
                    .catch((error) => {
                        Swal.fire({
                            title: "Error!",
                            text: "Wallet could not be deleted.",
                            icon: "error",
                        });
                    });
            }
        });
    };


    const getWallets = () => {
        axiosClient.get('/wallets')
            .then(({data}) => {
                setWallets(data.data);
            });
    }


    useEffect(() => {
        getWallets();
    }, []);





    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h1>Wallets</h1>
                {userRole ==='admin' && <Link className="btn-add" to="/wallet/add">
                    Add New
                </Link>}
                
            </div>
            <div className="card animated fadeInDown">
                <input
                    type="text"
                    placeholder="Search wallet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <table className="table-bordered table-striped">
                    <thead>
                    <tr className={"text-center"}>
                        <th>WALLET NAME</th>
                        <th>BALANCE</th>
                        {userRole ==='admin' && <th>ACTIONS</th>}
                        
                    </tr>
                    </thead>
                    {loading && (
                        <tbody>
                        <tr>
                            <td colSpan={3} className="text-center">
                                Loading...
                            </td>
                        </tr>
                        </tbody>
                    )}
                    {!loading && (
                        <tbody>
                        {filteredWallets.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center">
                                    No wallets found
                                </td>
                            </tr>
                        ) : (
                            filteredWallets.map((wallet) => (
                                <tr className={"text-center"} key={wallet.id}>
                                    <td>{wallet.name}</td>
                                    <td>{wallet.balance}</td>
                                    {userRole ==='admin' && 
                                    <td>
                                        <Link className="btn-edit" to={"/wallet/" + wallet.id}>
                                            Edit
                                        </Link>
                                        &nbsp;
                                        <button
                                            onClick={(e) => onDelete(wallet)}
                                            className="btn-delete">
                                            Delete
                                        </button>
                                    </td>
                                    }
                                    
                                </tr>
                            ))
                        )}
                        </tbody>
                    )}
                </table>
            </div>
        </>
    )
}
