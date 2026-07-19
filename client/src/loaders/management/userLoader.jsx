import axiosClient from "@/lib/axiosClient";

const LoaderUser = {
  getAllUsers: async ({ page = 1, search = '', status = '', is_verified = '', role_id = '', date_from = '', date_to = '' } = {}) => {
    const params = new URLSearchParams();
    params.set('page', page);
    if (search) params.set('search', search);
    if (status !== '') params.set('status', status);
    if (is_verified !== '') params.set('is_verified', is_verified);
    if (role_id) params.set('role_id', role_id);
    if (date_from) params.set('date_from', date_from);
    if (date_to) params.set('date_to', date_to);
    return axiosClient.get(`/management/user?${params.toString()}`);
  },
  getRolesDropdown: async () => {
    return axiosClient.get('/management/user/roles');
  },
  getUserById: async ({ params }) => {
    const { userId } = params;
    const url = `/management/user/${userId}`;
    const response = await axiosClient.get(url);
    return response;
  },
};

export default LoaderUser;
