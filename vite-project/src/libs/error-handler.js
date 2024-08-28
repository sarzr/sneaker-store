import { removeSessionToken } from "./session-manager";
import { toast } from "./toast";

export const errorHandler = (error) => {
  // console.log(error.response);

  const message = error.response?.data?.message;
  // console.log(error.response?.data);
  // console.log(error.response);

  if (typeof message === "string") {
    toast(message);
  } else if (Array.isArray(message)) {
    for (const msg of message) {
      toast(msg);
    }
  }
  const statusCode = Number(error.response?.data?.statusCode || 0);
  if (statusCode === 403) {
    removeSessionToken();
    toast("login again...");
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  }
};
