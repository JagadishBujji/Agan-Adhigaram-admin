import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { errorNotification,successNotification } from "src/utils/notification";


const logout = () => {
  console.log("logout");
  signOut(auth)
    .then(() => {
      console.log("successfully logged out");
      successNotification("Successfully logged out");
    })
    .catch((e) => {
      console.log("logout: ", e);
      errorNotification(e.message);
    });
};

export { logout };
