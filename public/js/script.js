var request = new XMLHttpRequest();
var configData = [];
request.open('GET', '/api/configurations', true);

request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
        var tableHeading_name = document.createElement('th');
        var tableHeading_hostname = document.createElement('th');
        var tableHeading_port = document.createElement('th');
        var tableHeading_username = document.createElement('th');
        tableHeading_name.innerHTML = '<a onclick="sortTable(0)">Name</a>';
        tableHeading_hostname.innerHTML = '<a onclick="sortTable(0)">Hostname</a>';
        tableHeading_port.innerHTML = '<a onclick="sortTable(0)">Port</a>';
        tableHeading_username.innerHTML = '<a onclick="sortTable(0)">Username</a>';
        document.getElementById('config-table-head').appendChild(tableHeading_name);
        document.getElementById('config-table-head').appendChild(tableHeading_hostname);
        document.getElementById('config-table-head').appendChild(tableHeading_port);
        document.getElementById('config-table-head').appendChild(tableHeading_username);

        var tableRow;
        var tableData_name;
        var tableData_hostname;
        var tableData_port;
        var tableData_username;
        var editButton;
        var deleteButton;

        var tableRow_edit;
        var tableData_name_edit;
        var tableData_hostname_edit;
        var tableData_port_edit;
        var tableData_username_edit;

        var data = JSON.parse(request.responseText);
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
            // editDeleteButton.innerHTML = '<button onclick="findConfig(' + i + ')">Edit/Delete</button>';
            editButton.innerHTML = '<form method="post" action="/edit-configuration/' + data[i].name + '"><input name="name" type="hidden" value=' + data[i].name + ' /><button type="submit">Edit</button></form>';
            deleteButton.innerHTML = '<form action="/configuration-deleted" method="post"><input type="hidden" value=' + data[i].name + ' name="name" /><button type="submit" onclick="return confirmDelete()">Delete</button></form>';

            tableData_name.innerHTML = data[i].name;
            tableData_hostname.innerHTML = data[i].hostname;
            tableData_port.innerHTML = data[i].port;
            tableData_username.innerHTML = data[i].username;
            tableRow.appendChild(tableData_name);
            tableRow.appendChild(tableData_hostname);
            tableRow.appendChild(tableData_port);
            tableRow.appendChild(tableData_username);
            tableRow.appendChild(editButton);
            tableRow.appendChild(deleteButton);

            document.getElementById('config-table-body').appendChild(tableRow);
        }
    } else {
        console.log(request.responseText);
    }

};

request.onerror = function(error) {
    console.log(error);
};

request.send();

var url = window.location.pathname;
var hostName = window.location.hostname;
var configName = url.slice(20);
var getUrl = '/api/configurations/' + configName;
var oldNameValue;
var nameValue;
var hostnameValue;
var portValue;
var usernameValue;

var xhr = new XMLHttpRequest();
xhr.open('GET', getUrl, true);

xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 400) {
        var data = JSON.parse(xhr.responseText);
        document.getElementById('_id').value = data[0]._id;
        document.getElementById('oldName').value = data[0].name;
        document.getElementById('name').value = data[0].name;
        document.getElementById('hostname').value = data[0].hostname;
        document.getElementById('port').value = data[0].port;
        document.getElementById('username').value = data[0].username;
    } else {
        console.log('request.responseText: ', xhr.responseText);
    }
};

xhr.onerror = function(error) {
    console.log('error: ', error);
};

xhr.send();
