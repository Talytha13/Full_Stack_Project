import axios from "axios";

// backend local
const API_BASE_URL = "https://silent-auction-psw5.onrender.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

