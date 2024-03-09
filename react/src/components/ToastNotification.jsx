import Swal from "sweetalert2";

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

const notification = (iconText, title, text,timer=5000)=>{
    Toast.fire({
        icon: iconText,
        title: title?title:iconText==='success'?'success':'Something went wrong!',
        text: text?text:'',
        timer: timer
    });
}

export {notification}