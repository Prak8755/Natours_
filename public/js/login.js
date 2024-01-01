import axios from 'axios';

export async function getLogin(email, password) {
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/v1/users/login',
      data: { email: email.value, password: password.value },
    });
    
    if(result.data.status==='success'){
          alert('logged in');
          setTimeout(()=>{
        location.assign('/')
          },1000)
        }
    
  } catch (err) {
    
    alert(err.response.data.message);
  }
}

export async function logout(){
try{
  const res=await axios({method:'GET',url:'http://localhost:8000/api/v1/users/logout'});
  if(res.data.status==='success')location.reload(true);
}
catch(err){
  alert('something wrong,Please try again')
}
}


// export async function getLogin(email,password) {
//     let result = await fetch('http://localhost:8000/api/v1/users/login', {
//       method: 'POST',
//       headers: { 'Content-type': 'application/json' },
//       body: JSON.stringify({ email:email.value, password:password.value }),
//     })
//     result=await result.json();
//     console.log(result);
//   if(result.status==='success'){
//     alert('logged in');
//     setTimeout(()=>{
//   location.assign('/')
//     },1000)
//   }
//   else{
//     alert(result.message);
//   }

// }
