import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const collection = 'users';

const getUserById = (id, sendData) => {
    const docRef = doc(db, collection, id);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          sendData({
            success: true,
            message: "Successfully Logged In",
            data: {
              id, // id: docSnap.id
              ...docSnap.data(),
            },
            err: null,
          });
        } else {
          // docSnap.data() will be undefined in this case
          console.log("No such document!");
          sendData({
            success: false,
            message: null,
            data: null,
            err: {
              name: "invalid_id",
              message: `No such document - path: ${collection}/${id}`,
              code: "",
              data: "",
            },
          });
        }
      })
      .catch((e) => {
        console.log("e: ", e);
        sendData({
          success: false,
          message: null,
          data: null,
          err: {
            name: "Firebase API Error",
            message: e.message,
            code: e.code,
            data: "",
          },
        });
      });
  };


export {getUserById}
