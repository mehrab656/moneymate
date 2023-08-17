import React from 'react';
import axiosClient from '../axios-client';
import {useStateContext} from "../contexts/ContextProvider.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";

export default function DownloadAttachment({filename}) {

    const {setNotification} = useStateContext();

    const handleDownload = async () => {
        try {
            const response = await axiosClient.get(`/download-file/${filename}`, {
                responseType: 'blob',
            });

            if (response.status !== 200) {
                setNotification('Error downloading file')
            }

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    return (
        <button className="btn btn-primary btn-sm" onClick={handleDownload}>
            <FontAwesomeIcon icon={faDownload}/>
        </button>
    );
}
