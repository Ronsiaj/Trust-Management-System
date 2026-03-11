import { loadingFalse } from "../Reducer/loaderSlice";
import ApiCall from "./ApiCall";
import { deleteAllCookies, reloadWindow } from "./Utils";

const Handler = async ({ method, url, data = {}, headers = {} }) => {
    let responseData = {};
    try {
        const response = await ApiCall({ url, method, data, headers });
        if (headers['Content-Type'] == 'application/zip') {
            responseData['success'] = true;
            responseData['data'] = response;
        } else if (response.success) {
            responseData['success'] = true;
            responseData['data'] = response;
        } else {
            responseData['success'] = false;
            responseData['data'] = response;
        }
    } catch (error) {
        responseData['success'] = error?.response?.data ? false : false;
        responseData['data'] = error?.response?.data || { message: "Retry after sometime" };
        loadingFalse()
        return responseData;

    } finally {
        let { success, data } = responseData;
        if (data.status == 401 || data.status == 504) {
            deleteAllCookies()
            reloadWindow()
        }
        switch (success) {
            case true:
                return { success: success, data: data?.data || data, message: data?.msg || data?.message, page: data?.page, total: data?.total, limit: data?.limit, token: data?.token };
            case false:
                return { success: success, message: data?.msg || data?.message };
            case 'retry':
                return { success: success, message: data?.msg || data?.message };
            default:
                return { success: success, message: data?.msg || data?.message };
        }
    }
};

export default Handler;