import axiosClient from "../api/axiosClient";


const homeService = {
    getHomeData: () => {
        return axiosClient.get('/home');
    },
};

export default homeService;