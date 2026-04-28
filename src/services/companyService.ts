import axios from "axios";
import { API_CONFIG } from "../config/api.config";

// Axios instance with default config
const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api`,
  headers: { "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true"}
});

// Intercept responses — if backend returns { success: false }, throw an error
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || "Backend returned failure");
    }
    return response;
  },
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Unknown error";
    throw new Error(message);
  }
);

export const registerCompany = async (companyData: any) => {
  const response = await api.post("/register", companyData);
  return response.data;
};

export const getAllCompanies = async () => {
  const response = await api.get("/");
  return response.data;
};

export const getCompanyById = async (id: string | number) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const updateCompany = async (id: string | number, companyData: any) => {
  const response = await api.put(`/${id}`, companyData);
  return response.data;
};

export const deleteCompany = async (id: string | number) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};