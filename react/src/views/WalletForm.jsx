import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import axiosClient from "../axios-client.js";
import MainLoader from "../components/MainLoader.jsx";

export default function WalletForm() {
    let {id} = useParams();
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const {setNotification} = useStateContext();

    const [wallet, setWallet] = useState({
        id: null,
        name: '',
        balance: ''
    });

    const getWallet = () => {
        setLoading(true)
        axiosClient.get(`/wallets/${id}`)
            .then(({data}) => {
                setWallet(data);
                setLoading(false)
            }).catch((e)=>{
                setLoading(false)
            })
    }

    if (id) {
        useEffect(() => {
            getWallet();
        }, []);
    }

    const walletSubmit = (e) => {
        e.preventDefault();
        setLoading(true)
        if (wallet.id) {
            axiosClient.put(`/wallets/${wallet.id}`, wallet)
                .then(() => {
                    setNotification("Wallet name has been updated");
                    navigate('/wallets');
                    setLoading(false)
                }).catch(error => {
                const response = error.response;
                if (response && response.status === 409) {
                    setErrors({name: ['Wallet name already exists']});
                } else if (response && response.status === 422) {
                    setErrors(response.data.errors);
                }
                setLoading(false)
            });

        } else {
            axiosClient.post('/wallets', wallet).then(({data}) => {
                setNotification(`${wallet.name} has been created`);
                navigate('/wallets');
                setLoading(false)
            }).catch(error => {
                const response = error.response;
                if (response && response.status === 409) {
                    setErrors({name: ['Wallet name already exists']});
                } else if (response && response.status === 422) {
                    setErrors(response.data.errors);
                }
                setLoading(false)
            });
        }
    }


    return (
        <>
         <MainLoader loaderVisible={loading} />
            {wallet.id && <h1>Update Wallet Name: {wallet.name}</h1>}
            {!wallet.id && <h1>Add New Wallet</h1>}

            <div className="card animated fadeInDown">
                {loading && (
                    <div className="text-center">
                        Loading...
                    </div>
                )}
                {errors &&
                    <div className="alert">
                        {Object.keys(errors).map(key => (
                            <p key={key}>{errors[key][0]}</p>
                        ))}
                    </div>
                }

                {!loading && (
                    <form onSubmit={walletSubmit}>
                        <div className="form-group">
                            <label htmlFor="wallet_name">Wallet Name</label>
                            <input value={wallet.name} onChange={e => setWallet({...wallet, name: e.target.value})}
                                   placeholder="Wallet Name"/>
                        </div>

                        <div className="form-group">
                            <label htmlFor="wallet_name">Wallet Balance</label>
                            <input value={wallet.balance}
                                   onChange={e => setWallet({...wallet, balance: e.target.value})}
                                   placeholder="Wallet Balance"/>
                        </div>

                        <button
                            className={wallet.id ? "btn-edit" : "btn-add"}>{wallet.id ? "Update wallet name" : "Add new wallet"}</button>
                    </form>
                )}
            </div>
        </>
    )
}
