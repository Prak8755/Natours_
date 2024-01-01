import axios from 'axios';

export async function updateSettings(data, type) {
 
  try {
    const url =
      type === 'settings'
        ? 'http://localhost:8000/api/v1/users/updateMe'
        : 'http://localhost:8000/api/v1/users/updateMyPassword';
    let result = await axios({
      method: 'PATCH',
      url,
      data,
    });
    console.log(result);
    if (result.data.status === 'success') {
      alert('Updated successfully');
    }
  } catch (err) {
    alert(err.response.data.message);
  }
}
