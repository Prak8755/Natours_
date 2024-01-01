import axios from 'axios';

export async function updateSettings(data, type) {
 
  try {
    const url =
      type === 'settings'
        ? '/api/v1/users/updateMe'
        : '/api/v1/users/updateMyPassword';
    let result = await axios({
      method: 'PATCH',
      url,
      data,
    });
    // console.log(result);
    if (result.data.status === 'success') {
      alert('Updated successfully');
    }
  } catch (err) {
    alert(err.response.data.message);
  }
}
