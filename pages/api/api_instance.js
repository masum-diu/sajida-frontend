import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://engine.sajidahospital.org/api",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN || "532|gzPP5OlkkD0NYC8NS4D78wIx6frYKqENAQabPs6N6b0de79e"}`,
    timeout: 1000,
  },
});

export default instance;
