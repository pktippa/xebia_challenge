function submitSearch(){
    var author_Val = document.getElementById('author').value;
    var genre_Val = document.getElementById('genre').value;
    var book_title_Val = document.getElementById('book_title').value;
    var query = '?';
    var token = sessionStorage.token;
    if (!token) {
      document.getElementById('search_login_div').hidden = false;
      return alert('Please login first to perform the search');
    }
    if(author_Val) {
      query += '&author=' + author_Val
    }
    if(genre_Val) {
      query += '&genre=' + genre_Val
    }
    if(book_title_Val) {
      query += '&book_title=' + book_title_Val
    }
    // URL want to hit
    var url = 'http://localhost:3000/searchBooks' + query
    // Opening up new XMLHttpRequest
    var http = new XMLHttpRequest()
    // Making a GET request
    http.open('GET',url, true)
    // onready state
    http.onreadystatechange = function() {//Call a function when the state changes.
      // Checking the readystate is when the HEADERS are recieved
      if(http.readyState == 4) {
        if (http.status == 200) {
          // Alerting the particular header from the object
          //alert(http.responseText);
          var resJson = JSON.parse(http.responseText);
          if (resJson.length > 0) {
            var table = document.getElementById('search_result');
            for (var i = 0 ; i < resJson.length; i++) {
              var tr = document.createElement("tr");
              var td = document.createElement("td");
              var txt = document.createTextNode(resJson[i].author);
              td.appendChild(txt);
              tr.appendChild(td);
              var td = document.createElement("td");
              var txt = document.createTextNode(resJson[i].genre);
              td.appendChild(txt);
              tr.appendChild(td);
              var td = document.createElement("td");
              var txt = document.createTextNode(resJson[i].book_title);
              td.appendChild(txt);
              tr.appendChild(td);
              if(resJson[i].isCoverAvailable) {
                var td = document.createElement("td");
                var a = document.createElement('a');
                var txt = document.createTextNode(resJson[i].cover);
                a.appendChild(txt);
                a.href = "http://localhost:3000/img/" + resJson[i].cover;
                td.appendChild(a);
                tr.appendChild(td);
              }
              table.appendChild(tr);
            }
          } else {
            alert('No results found');
          }
        }
        console.log('status ', http.status);
      }
    };
    http.send();
  }

function submitBook() {
  var author = document.getElementById('adb_author').value;
  var genre = document.getElementById('adb_genre').value;
  var book_title = document.getElementById('adb_book_title').value;
  var cover_image = document.getElementById('adb_cover_image');
  console.log('cover', cover_image, cover_image.files, cover_image.files[0]);
  var obj = {
    author: author,
    genre: genre,
    book_title: book_title
  }
  if (cover_image.value && cover_image.files && cover_image.files[0]) {
    var reader = new FileReader();
    reader.onload = function(event) {
      obj['isCoverAvailable'] = true;
      obj['cover'] = event.target.result;
      httpReqBookSubmit(obj);
    }
    reader.readAsDataURL(cover_image.files[0]);
  } else {
    obj['isCoverAvailable'] = false;
    httpReqBookSubmit(obj);
  }
}

function httpReqBookSubmit(data) {
  // URL want to hit
  var url = 'http://localhost:3000/addBook'
  // Opening up new XMLHttpRequest
  var http = new XMLHttpRequest()
  var FD  = new FormData();
  for (name in data) {
    FD.append(name, data[name])
  }
  // Making a POST request
  http.open('POST',url, true)
  // Setting up Request headers
  //http.setRequestHeader("Content-type","application/json")
  http.setRequestHeader("Content-type","multipart/form-data")
  //http.setRequestHeader("Content-type","application/x-www-form-urlencoded")
  http.setRequestHeader("token",sessionStorage.token);
  // Sending the POST data
  http.send(FD)
  //http.send(data)
  // On ready state
  http.onreadystatechange = function() {//Call a function when the state changes.
    // Checking the readystate is when the HEADERS are recieved
    if(http.readyState == 4) {
      if(http.status == 200) {
        
      }
    }
  };
}