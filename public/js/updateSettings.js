import axios from 'axios';
import { showAlert } from './alerts';

//type is eaither password or data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/updateMyPassword'
        : 'http://localhost:3000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated Succesfully`);
    }
  } catch (error) {
    showAlert('error', error);
    console.log(error.message);
  }
};
