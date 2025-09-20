import axios from "axios";

// const axiosClient = axios.create({
//     baseURL: `${import.meta.env.VITE_APP_BASE_URL}/api`
// });


const axiosClient = axios.create({
    baseURL: `${window.__APP_CONFIG__.VITE_APP_BASE_URL}/api`
});

axiosClient.interceptors.request.use((config) => {

    const token = localStorage.getItem('ACCESS_TOKEN');
    config.headers.Authorization = `Bearer ${token}`;
    return config;


});

axiosClient.interceptors.response.use((response) => {
    return response;
}, (error) => {
    const {response} = error;
    if (response.status === 401) {
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('user_role');
    }

    if (response.status === 403) {
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('user_role');
    }

    throw error;
})

axios.interceptors.response.use(function (response) {
        return response;
    }, function (error) {
        if (error.response.status === 403) // access denied
        {
            swal("Forbidden", error.response.data.message, "warning");
            history.push('/403');
        } else if (error.response.status === 404) // page not found
        {
            swal("404 Error", "URL/Page not found", "warning");
            history.push('/404');
        }

        return  Promise.reject(error);
    }
);

export default axiosClient;
