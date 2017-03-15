var xhr = new XMLHttpRequest();
var configData = [];

xhr.open('GET', '/api/configurations', true);

xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 400) {
        var tableRow;
        var tableData_name;
        var tableData_hostname;
        var tableData_port;
        var tableData_username;
        var editButton;
        var deleteButton;

        var data = JSON.parse(xhr.responseText);
        document.createElement('th').innerHTML;

        for (var i = 0; i < data.length; i++) {
            configData.push(data[i]._id);
            tableRow = document.createElement('tr');
            tableData_name = document.createElement('td');
            tableData_hostname = document.createElement('td');
            tableData_port = document.createElement('td');
            tableData_username = document.createElement('td');
            editButton = document.createElement('td');
            deleteButton = document.createElement('td');
            editButton.innerHTML = '<form method="post" action="/edit-configuration/' + data[i].name + '"><input name="name" type="hidden" value=' + data[i].name + ' /><button type="submit">Edit</button></form>';
            deleteButton.innerHTML = '<form action="/configuration-deleted" method="post"><input type="hidden" value=' + data[i].name + ' name="name" /><button type="submit" onclick="return confirmDelete()">Delete</button></form>';

            tableData_name.innerHTML = data[i].name;
            tableData_hostname.innerHTML = data[i].hostname;
            tableData_port.innerHTML = data[i].port;
            tableData_username.innerHTML = data[i].username;
            tableRow.setAttribute("id", (i + 1));
            tableRow.appendChild(tableData_name);
            tableRow.appendChild(tableData_hostname);
            tableRow.appendChild(tableData_port);
            tableRow.appendChild(tableData_username);
            tableRow.appendChild(editButton);
            tableRow.appendChild(deleteButton);

            document.getElementById('config-table').appendChild(tableRow);
            if (tableRow.id < 11) {
                tableRow.style.display = 'table-row';
                document.getElementById('config-results').innerHTML = 'Results 1 to 10 of ' + data.length;
            } else {
                tableRow.style.display = 'none';
            }
        }



        var numberOfPages = Math.ceil(data.length/10);

        function pageClick() {
            var tableRow = document.getElementById('config-table-body').getElementsByTagName('tr');
            var rowArray = [];
            for (var i = 0; i < tableRow.length; i++) {
                if (tableRow[i].id > this.innerHTML * 10 - 10 && tableRow[i].id < this.innerHTML * 10 + 1) {
                    tableRow[i].style.display = 'table-row';
                    rowArray.push(tableRow[i].id);
                    document.getElementById('config-results').innerHTML = 'Results ' + rowArray[0] + ' to ' + rowArray[rowArray.length - 1] + ' of ' + data.length;
                } else {
                    tableRow[i].style.display = "none";
                }
            }
        }

        for (var i = 0; i < numberOfPages; i++) {
            var pageNumber = document.createElement('button');
            pageNumber.innerHTML = (i + 1);
            pageNumber.className = 'page-number';
            pageNumber.onclick = pageClick;
            document.getElementById('page-numbers').appendChild(pageNumber);
        }


    } else {
        console.log(xhr.responseText);
    }

}; /* end xhr.onload */

xhr.onerror = function(error) {
    console.log(error);
};

xhr.send();

function confirmDelete() {
    if (window.confirm("Delete configuration?")) {
        return;
    } else {
        return false;
    }
}

/*
    sorting
*/
function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("config-table");
  switching = true;
  //Set the sorting direction to ascending:
  dir = "asc";
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.getElementsByTagName("TR");
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount ++;
    } else {
      /*If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}
