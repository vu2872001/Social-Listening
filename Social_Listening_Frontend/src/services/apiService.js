import axios from "axios";
import { notifyService } from "../services/notifyService";
import { customHistory } from "../routes/CustomRouter";
import environment from "../constants/environment/environment.dev";

const axiosInstance = axios.create({
	baseURL: environment.baseUrl,
	timeout: 20000, // response timeout
	// signal: AbortSignal.timeout(10000), // connection timeout
});

axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers = {
				...config.headers,
				Authorization: `Bearer ${token}`,
			};
		}
		return config;
	},
	(error) => {
		notifyService.showErrorMessage({ description: error });
		return Promise.reject(error);
	}
);

axiosInstance.interceptors.response.use(
	(resp) => {
		if (resp?.data?.message) {
			notifyService.showErrorMessage({
				description: resp.data.message,
			});
		}
		return resp?.data;
	},
	(error) => {
		console.log(error);
		if (error.response?.status === 401) {
			notifyService.showErrorMessage({ description: "Unauthorized" });
			customHistory.push("/login");
		} else if (error.response?.status === 403) {
			notifyService.showErrorMessage({
				description: "Forbidden Resource",
			});
			customHistory.push("/forbidden");
		}
		// else if (error.response.status === 500) {
		//   notifyService.showErrorMessage(null, "Server Error");
		//   customHistory.push("/error");
		// }
		else {
			if (error.response?.data?.message) {
				notifyService.showErrorMessage({
					description: error.response.data.message,
				});
			} else {
				notifyService.showErrorMessage({
					description: error.message,
				});
			}
		}
	}
);

export const apiService = axiosInstance;
