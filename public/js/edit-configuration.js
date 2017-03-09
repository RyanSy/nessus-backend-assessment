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
