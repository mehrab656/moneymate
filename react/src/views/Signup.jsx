import {Link} from "react-router-dom";
import {useContext, useEffect, useRef, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import {SettingsContext} from "../contexts/SettingsContext.jsx";
import MainLoader from '../components/loader/MainLoader.jsx';

export default function Signup() {

    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const [errors, setErrors] = useState(null);
    const {setUser, setToken} = useStateContext();
    const {applicationSettings, setUserRole} = useContext(SettingsContext);
    const {
        default_currency,
        registration_type,
        product_price
    } = applicationSettings;

    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(null);



    useEffect(() => {
        document.title = "Signup";
    }, []);


    const formSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // IncomeShow loading effect

        const payLoad = {
            name: nameRef.current.value,
            email: emailRef.current.value,
            password: passwordRef.current.value,
            password_confirmation: passwordConfirmRef.current.value,
        };

        try {
            // Send the user data to your server
            const {data} = await axiosClient.post('/signup', payLoad);
            setUser(data.user);
            setUserRole(data.user_role);
            setToken(data.token);
            setLoading(false);
        } catch (error) {
            const response = error.response;
            if (response && response.status === 422) {
                setErrors(response.data.errors);
            }
        } finally {
            setLoading(false); // Hide loading effect
        }
    };


    return (
        <div className="login-signup-form animated fadeInDown">
         <MainLoader loaderVisible={loading} />
            {loading && (
                <div
                    ref={loadingRef}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 999,
                    }}
                >
                    {/* Add your macOS-like loading spinner or animation here */}
                    <div className="loading-spinner"/>
                </div>
            )}
            <div className="form">
                <form onSubmit={formSubmit} action="">
                    {registration_type === 'free' ?
                        <div className="alert alert-info title">Signup for free</div> :
                        <div className="alert alert-warning title">Subscribe
                            for {default_currency + product_price} / Month</div>
                    }

                    <hr/>
                    <div className="form-group">
                        <label className="custom-form-label" htmlFor="full_name">Full Name</label>
                        <input className="custom-form-control" ref={nameRef} type="text" placeholder="Full Name"/>
                        {errors && errors.name && <p className="error-message mt-2">{errors.name[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label className="custom-form-label" htmlFor="email_address">Email</label>
                        <input className="custom-form-control" ref={emailRef} type="email" placeholder="Email Address"/>
                        {errors && errors.email && <p className="error-message mt-2">{errors.email[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label className="custom-form-label" htmlFor="password">Password</label>
                        <input className="custom-form-control" ref={passwordRef} type="password"
                               placeholder="Password"/>
                        {errors && errors.password && <p className="error-message mt-2">{errors.password[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label className="custom-form-label" htmlFor="password_confirmation">Confirm Password</label>
                        <input className="custom-form-control" ref={passwordConfirmRef} type="password"
                               placeholder="Password Confirmation"/>
                        {errors && errors.password_confirmation &&
                            <p className="error-message mt-2">{errors.password_confirmation[0]}</p>}
                    </div>

                    <button className="btn-add btn-block">{loading ? 'Signing up...' : 'Sign up'}</button>
                    <p className="message">
                        Already registered ? <Link to="/login">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

