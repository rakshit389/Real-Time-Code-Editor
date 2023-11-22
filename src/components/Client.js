import React from 'react';
import Avatar from 'react-avatar';
import { Button } from 'react-bootstrap';
import ACTIONS from "../Action";
import { useLocation } from 'react-router-dom';

const Client = ( props  ) => {

    const removeUser = (socket_id,roomId) => {
         console.log("rooming" , props.roomId)
         props.socketRef.emit(ACTIONS.REMOVE , { socket_id , roomId })
    }
    return (
        <div className="client">
            <Avatar name={props.username} size={45} round="14px" />
            <span className="userName" >{props.username}</span> 
             {
                props.adminSocketId == props.socketRef.id ? <Button size="sm" variant='danger' 
                                        onClick={ () => removeUser(props.socketId , props.roomId)} style={{marginTop:'0.5rem'}}>Remove</Button>
                                        :null
             }
            
        </div>
    );
};

export default Client;