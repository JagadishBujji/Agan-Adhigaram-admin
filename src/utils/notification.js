import { toast } from "react-toastify";

const successNotification = (message) => {
  toast.success(message, {
    position: toast.POSITION.TOP_RIGHT,
  });
};

const errorNotification = (message) => {
  toast.error(message, {
    position: toast.POSITION.TOP_RIGHT,
  });
};

const infoNotification = (message) => {
  toast.info(message, {
    position: toast.POSITION.TOP_RIGHT,
  });
};

const warningNotification = (message) => {
  toast.warning(message, {
    position: toast.POSITION.TOP_RIGHT,
  });
};

export {
  successNotification,
  errorNotification,
  infoNotification,
  warningNotification,
};
