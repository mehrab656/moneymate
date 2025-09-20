import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const defaultContent ={
    logo:'',
    guestName:'',
    message:'',
    wifi:{
        name:'Malinstay Homes Rental LLC 5G',
        password:'malinstay',
    },
    transparency:0.4,
    textColor:'#fff',
    checkInDate:'',
    checkInTime:' After 3:00 PM'
}
export default function WelcomeScreen() {
    const [imageContent, setImageContent] = useState(defaultContent);
    return (
        <div className="container py-5 position-relative">
            <div className="row  welcome-screen-main-div  shadow overflow-hidden"
                 style={{backgroundImage: `url(${'room-image.jpg'})`}}>
                {/* Left Side: Text & Logo */}
                <div className="col-md-6 p-4 d-flex flex-column justify-content-between welcome-screen-left-div">
                    <div>
                        <img src="/malinstay-logo.png" alt="Malinstay Logo" style={{maxWidth: '120px'}}
                             className="mb-3"/>
                        <p className={"welcome-text"}>
                            <strong>Dear Guest,</strong><br/>
                            Welcome and thank you for choosing <strong>Malinstay Homes Rental LLC</strong> for your stay
                            in Dubai!<br/><br/>
                            We’re thrilled to host you and hope you enjoy a clean, comfortable, and relaxing experience
                            in your apartment. Your home has been carefully prepared with your comfort in
                            mind.<br/><br/>
                            Wishing you a wonderful stay and memorable moments in Dubai!<br/>
                            Enjoy your stay with <strong>Malinstay – Where comfort meets hospitality.</strong>
                        </p>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-4">
                        <div>
                            <strong style={{color: '#fff'}}>WIFI Details</strong><br/>
                            <span>Wifi Name: {imageContent.wifi.name}</span><br/>
                            <span>Wifi Password: {imageContent.wifi.password}</span>
                        </div>
                        <img src="/qr-code.png" alt="QR Code" style={{width: '80px'}}/>
                    </div>
                </div>

                {/* Right Side: Image */}
                <div className="col-md-6 p-0">

                </div>
            </div>
            <div className={"row welcome-screen-footer p-2"}>
                <div className="col-6 welcome-screen-footer-left">
                    <div>
                        <strong style={{color: '#fff'}}>MALINSTAY.COM</strong><br/>
                        <span>📞 +971 551258910</span>
                    </div>
                </div>
                <div class="col-6 welcome-screen-footer-right">
                    <img src="/qr-code.png" alt="QR Code" style={{width: '80px'}}/>
                </div>
            </div>
            <div className={'slider-image position-absolute '}>
                <img src="/slider-image.jpg" alt="QR Code"/>
            </div>
        </div>
    );
}
