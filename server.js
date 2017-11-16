var net = require('net');
var utf8 = require('utf-8');

const PORT = process.env.OPENSHIFT_NODEJS_PORT || 8080;
const HOST = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var clients = [];

net.createServer(function(socket){
  
  console.log('Connnected :', socket.remoteAddress, socket.remotePort);
  
  socket.on('data',function(data){
    let obj = JSON.parse(data);
    let type = obj[0].type;

    console.log('DATA :', obj);

    if(type === 'createUser'){
      let username = obj[0].username;

      if(clients.length == 0){

        socket.name = username;
        clients.push(socket);  
        socket.write(`username : ${username} create finish`);          
        console.log('createUser :', username, 'create finish'); 

      }else{

        for(let i = 0; i < clients.length; i++){
          let client = clients[i];
          if(client.name === username){
            socket.write(`username : ${username} exist`);
            console.log('createUser :', username, 'exist');  
          }else{
            socket.name = username;
            clients.push(socket);  
            socket.write(`username : ${username} create finish`);          
            console.log('createUser :', username, 'create finish');          
          }
        }
      }
      

      
    }

    if(type === 'message'){
      let message = obj[0].content;
      sendMessageToClient(clients, socket, message);      
    }

  });

  socket.on('close',function(data){
    console.log('CLOSE :', socket.remoteAddress, socket.remotePort);

    deleteClient(clients, socket);

  }); 
  
}).listen(PORT, HOST);

const sendMessageToClient = function(clients, socket, message){

  for(let i = 0; i < clients.length; i++){
    let client = clients[i];
    if(client === socket){
      //Do Nothing
      console.log(socket.name,' said :',message);      
      
    }else{
      client.write(`${socket.name} said : ${message}`);        
    }
  }

}

const deleteClient = function(clients, socket){

  for(let i = 0; i < clients.length; i++){
    let client = clients[i];
    if(client === socket){
      console.log('user', client.name, 'disconnet');
      clients.splice(i, 1 );
    }else{
      //Do Nothing        
    }
  }

}

console.log('Server listening on ', HOST, ':', PORT);


