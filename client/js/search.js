function submitSearch(){
    var author_Val = document.getElementById('author').value;
    var genre_Val = document.getElementById('genre').value;
    var book_title_Val = document.getElementById('book_title').value;
    var query = '?';
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
          }
        }
        console.log('status ', http.status);
      }
    };
    http.send();
  }