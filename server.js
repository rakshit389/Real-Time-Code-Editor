const express = require('express')
const cors = require('cors');
const app = express();
const http = require('http');
const path = require('path');
const {Server}  = require('socket.io');
const ACTIONS = require('./src/Action');

const server = http.createServer(app);

 

const io = new Server(server);

 

const userSocketMap = {};
const admins = {} ;

const addAdmin = (socket_id,username,roomId) => {

        const roomInfo = io.sockets.adapter.rooms.get(roomId);
        if(roomInfo)
        {
            if ( roomInfo.size == 1)
            {
                admins[roomId] = [ socket_id , username ] ;
            }
        }
}

function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
 
    socket.on(ACTIONS.JOIN, async({ roomId, username }) => {

        userSocketMap[socket.id] = username;
        socket.join(roomId);
        addAdmin(socket.id,username,roomId);
        const adminSocketId = admins[roomId][0];
        const adminName = admins[roomId][1] ;
        const clients = getAllConnectedClients(roomId);
        const room_members = clients.filter( (client)=> {
                return client.socketId !=  adminSocketId ;
        })
        console.log("new user joined" , userSocketMap[socket.id])
        io.to(roomId).emit(ACTIONS.JOINED, {
                room_members,
                username,
                adminSocketId,
                adminName,
                socketId: socket.id,
        });
        io.to(adminSocketId).emit(ACTIONS.SYNC_CODE , { socketId : socket.id } ) ;      //Directed to admin to send code to newly joined socket
    });

    socket.on(ACTIONS.REMOVE , ({socket_id,roomId}) => {

        
        const removed_username = userSocketMap[socket_id] ;
        io.in(socket_id).socketsLeave(roomId);
        const clients = getAllConnectedClients(roomId);
        const adminSocketId = admins[roomId][0] ;
        const room_members = clients.filter( (client)=> {
            return client.socketId !=  adminSocketId ;
        })
        io.in(roomId).emit(ACTIONS.UPDATE_USERS , { room_members })
        io.to(socket_id).emit( ACTIONS.REMOVED, {} );
        io.to(roomId).emit( ACTIONS.REMOVED_INFO , { removed_username })
    })

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId , roomId , code }) => {                  // Sending code to newly joined socket
        setTimeout( ()=> {
            io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
        },3000) ;
    });

    socket.on( ACTIONS.DISCONNECTED, () => {
        const rooms = [...socket.rooms];
        console.log(rooms)
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        
    });

    socket.on('disconnecting', () => {
      
        let rooms = [...socket.rooms]
        rooms = rooms.filter(roomId =>{ return roomId !== socket.id });
        Object.values(rooms).forEach(value => {

              if( socket.id == admins[value][0] )
              {
                io.to(rooms).emit(ACTIONS.UPDATE_ADMIN, { });
            
              }
              else
              {
                    io.to(value).emit( ACTIONS.DISCONNECTED, {
                    socketId: socket.id,
                    username: userSocketMap[socket.id],
            
                });
              }
          });
        delete userSocketMap[socket.id];
    });

    socket.on('disconnect', () => {
        console.log('User disconnected' , userSocketMap[socket.id]);
    });


    socket.on("typing",({username})=>{
        socket.broadcast.emit("typing",{username:username});
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT,()=>{
  
      console.log(`Listening on PORT ${PORT}`);
});