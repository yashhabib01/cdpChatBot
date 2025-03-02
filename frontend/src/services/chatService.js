import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log(API_BASE_URL);

export const sendMessage = async (query) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, { query });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
