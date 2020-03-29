var http = require('http');
var httpClient = require('http');

var fs = require('fs');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

console.log('Listening on port 8081...');

io.sockets.on('connect', function (socket) {
   console.log('Un client est connecté !');

   socket.on('init', function () {   
   
   console.log('Initialisation...');
   /* paramètre url de base du service */
   var serviceHost = 'data.fixer.io';

   /* clé d'api fournie à l'inscription au service */
   var apiKey = '412e09694588a610eee73b014122cb69';

   /* points d'entrée pour consommer les fonctions */
   var operation = 'symbols';

   /* message générique si le service est indisponible quelque'en soit la raison */
   var unavailableMessage = 'This service is unavailable. Please try later.';

   var endpoint = '/api/' + operation + '?access_key=' +  apiKey;

   console.log('Querying: ' + serviceHost + endpoint + '...');

   var headers = {};
   var method = 'GET';

   var options = {
     host: serviceHost,
     path: endpoint,
     method: method,
     headers: headers
   };
  var that = this;
  var req = httpClient.get(options, function(res, socket) {
    res.setEncoding('utf-8');
    req.setTimeout(5000, function () { console.log ('request timeout'); that.emit('error', 'request timeout'); });

    var responseString = '';
    
    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      that.emit('message', responseString);
      console.log(responseString);
    });
  });
  
  req.end();

});


  socket.on('convert', function (params) {
   var paramsObj = JSON.parse(params);
   console.log('Conversion de ' + paramsObj.amount + ' EUR. en ' + paramsObj.currency);
  
   /* paramètre url de base du service */
   var serviceHost = 'data.fixer.io';

   /* clé d'api fournie à l'inscription au service */
   var apiKey = '412e09694588a610eee73b014122cb69';

   /* points d'entrée pour consommer les fonctions */
   var operation = 'latest';

   /* message générique si le service est indisponible quelque'en soit la raison */
   var unavailableMessage = 'This service is unavailable. Please try later.';

   var endpoint = '/api/' + operation + '?access_key=' +  apiKey;

   console.log('Querying: ' + serviceHost + endpoint + '...');

   var headers = {};
   var method = 'GET';

   var options = {
     host: serviceHost,
     path: endpoint,
     method: method,
     headers: headers
   };
 

    var req = httpClient.get(options, function(res) {
    res.setEncoding('utf-8');
    req.setTimeout(5000, function () { console.log ('request timeout'); that.emit('error', 'request timeout'); });

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      console.log(responseString);
      var data = JSON.parse (responseString);
      var results = data.rates;
      var currency = paramsObj.currency;

        for (let [key, value] of Object.entries(results)) {
            if (key === currency) {
               var rateValue = value;
            }
          }
        /* A t'on bien trouvé le taux associé à la devise saisie ? si non, affiche une erreur et on sort. */
        if ( !rateValue || 0 === rateValue.length) { that.emit ('error', 'Selected currency rate was not found, can not apply conversion.'); return; }

         /* on applique le taux au montant saisi */
      var conversionAmount = rateValue * paramsObj.amount ;
      var result = conversionAmount + ' ' + currency;
      console.log ('result is: ' + result);
      socket.emit('success', result);
    }.bind({'paramsObj': paramsObj,'socket': socket}));
  }.bind({'socket': socket}));

  req.end();
   
 }.bind({'socket': socket}));
});

server.listen(8081);
