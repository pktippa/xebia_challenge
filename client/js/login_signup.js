function login(){
  console.log('Login clicked');
  var username = document.getElementById('login_usename').value;
  var password = document.getElementById('login_password').value;
  if (username && password) {
    var obj = {
      username: username,
      password: password
    };
    // URL want to hit
    var url = 'http://localhost:3000/login'
    // Opening up new XMLHttpRequest
    var http = new XMLHttpRequest()
    // Making a POST request
    http.open('POST',url, true)
    // Setting up Request headers
    http.setRequestHeader("Content-type","application/json")
    // Constructing POST data
    data = obj;
    // Sending the POST data
    http.send(JSON.stringify(obj))
    // On ready state
    http.onreadystatechange = function() {//Call a function when the state changes.
        // Checking the readystate is when the HEADERS are recieved
        if(http.readyState == 4) {
          if(http.status == 200) {
            var resJson = JSON.parse(http.responseText);
            if (resJson.authorized) {
              sessionStorage.setItem('token', resJson.token);
            } else {
              alert('Unauthorized, please login with valid credentials');
            }            
          }
        }
    }
  } else {
    alert('Username and password both are mandatory');
  }
  
}

function signup(){
  console.log('Signup clicked')
}