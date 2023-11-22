import React, { useEffect, useState,useRef } from "react";
import Loader from "../components/Loader";
import Admin from "../components/Admin";
import "../App.css";
import Navbars from "../components/Navbar";
import Client from "../components/Client";
import compile from "../components/compile";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import toast from 'react-hot-toast';
import ACTIONS from "../Action";
import { useParams,useLocation,useNavigate,Navigate} from "react-router-dom";
import {Button , Form } from 'react-bootstrap'
import Preloader from "../components/Preloader";
import Compiling from "../components/Compiling";

const EditorPage = () => {

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const {roomId} = useParams();
  const location = useLocation();
  const editorRef = useRef(null);
  const [language , setLanguage] = useState(null);
  const [input , setInput] = useState(null)
  const langRef = useRef(null);
  const [compile , setCompile ]= useState(0) ;
  const [ showloading , setShowloading ] = useState(0) ;
  const [adminname , setAdminname ] = useState(null);
  const [adminsocketid , setAdminsocketid] = useState(null) ;
  const reactNavigator = useNavigate();
  const [showoutput , setShowoutput ] = useState(0);
  const [output , setOutput ] = useState(null);
  const [Loading, SetLoading] = useState(true);
  const [Clients, SetClients] = useState([
    { socketId: 1, username: "Rakesh k" },
    { socketId: 2, username: "Akash K" },
  ]);

 
 
  useEffect(() => {

    
    let ding = new Audio('/ding.mp3');
    setTimeout(() => {
      SetLoading(false);
      ding.play();
    }, 3000);
  }, []);

  

  useEffect ( () => {
      
    if( !language   && langRef.current )
    {
       console.log(codeRef.current)
       langRef.current.classList.add('focused');
    }

    if ( compile && language && codeRef.current != null && codeRef.current != '')
    {
        const compile_code = async(language,code) => {
        let stdin = '' ;
        if(input)
        {
          let trimmed_input = input.toString().trim();
          const refinedInput = trimmed_input.split("\n");
          for( const element of refinedInput)
          {
             let trimmed_element = element.trim();
             stdin = stdin + trimmed_element + "\n";
          }
        }
      
          var raw = JSON.stringify({
              "clientId": "5d5f60c838feeb885bd25cdd5fa5a164",
              "clientSecret": "8c3b9520136b6312ea59a490a3bb68f2fb2e5ea121d570fafdf2bc47c1c95b47",
              "script":  code ,
              "language": language,
              "versionIndex" : "0" ,
              "stdin" : stdin ,
            });
      
            var requestOptions = {
              method: 'POST',
              headers: {
                "Content-Type" : "application/json"
              },
              body: raw,
              redirect: 'follow'
            };
      
            await fetch("https://api.jdoodle.com/v1/execute", requestOptions)
                                          .then(response =>{ return response.json() ;  })
                                          .then( (data) => {
                                              
                                              setOutput(data.output)
                                              setShowoutput(1)
                                              setShowloading(0)
                                          })
                                          .catch(error => console.log('error', error));
        
        }
        compile_code(language,codeRef.current);
    }
    setCompile(0);

  },[compile,language,codeRef.current])
  
  useEffect(()=>{
  
      const init = async() =>{

           socketRef.current = await initSocket();
           socketRef.current.on('connect_error', (err) => handleErrors(err));
           socketRef.current.on('connect_failed', (err) => handleErrors(err));

           function handleErrors(e) {
               toast.error('Socket connection failed, try again later.');
               reactNavigator('/');
           }

           socketRef.current.emit(ACTIONS.JOIN,{

             roomId,
             username:location.state?.username,
             
           });


            // Listening for joined event
            socketRef.current.on(
              ACTIONS.JOINED,
              ({ room_members , username,  adminSocketId , adminName, socketId }) => {
        
                  if (username !== location.state?.username) {
                      let Join = new Audio('/Join.mp3');
                      setTimeout( () => {
                          Join.play();
                      },1000)
                      toast.success(`${username} joined the room.`);
                      console.log(`${username} joined`);
                  }

                  setAdminname(adminName);
                  setAdminsocketid(adminSocketId);
                  SetClients(room_members);
                 
              }
          );
         
          socketRef.current.on(ACTIONS.UPDATE_USERS , ({ room_members }) => {
 
                SetClients(room_members);
          })

          socketRef.current.on( ACTIONS.REMOVED , () => {

                let Left = new Audio('/Left.mp3');
                Left.play();
                leaveRoom() ;
          })

          socketRef.current.on( ACTIONS.REMOVED_INFO , ({removed_username}) => {

            toast.success(`Admin removed ${removed_username}.`);
          })

          socketRef.current.on(ACTIONS.UPDATE_ADMIN , ()=> {
             console.log("admin left")
             setAdminname(null);
             toast.success('Admin Left');
          })
     
          //Listening For Typing
          socketRef.current.on("typing",({username})=>{
              
              if(username)
              {
                  document.getElementById('type').innerHTML = `${username} is typing...`;
              }
              else
              {
                document.getElementById('type').innerHTML = '';
              }
               
          });

          // Listening for disconnected
          socketRef.current.on(
              ACTIONS.DISCONNECTED,
              ({ socketId, username }) => {
                  console.log("called")
                  let Left = new Audio('/Left.mp3');
                  toast.success(`${username} left the room.`);
                  Left.play();
                  SetClients((prev) => {
                      return prev.filter(
                          (client) => client.socketId !== socketId
                      );
                  });
              }
          );
    

      };

      init();
      return () => {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off(ACTIONS.UPDATE_USERS);
        socketRef.current.off(ACTIONS.REMOVED_INFO);
        socketRef.current.off(ACTIONS.REMOVED);
       
    };

  },[]);

  async function copyRoomId() {
    try {
        await navigator.clipboard.writeText(roomId);
        toast.success('Room ID has been copied to your clipboard');
    } catch (err) {
        toast.error('Could not copy the Room ID');
     
    }
}

function leaveRoom() {
    socketRef.current.emit(ACTIONS.DISCONNECTED , {} )
    reactNavigator('/');
}
 
const takeInput = (e) => {
  if( e.target.value)
  {
     setInput(e.target.value);
  }
};

const stopCompiling = () => {
    setShowloading(0)
    setShowoutput(0)
}
 
 

  if (Loading) {
    return <Loader />;
  } else {
    return (
      <div className="mainWrap"  >
        <div className="aside">
          <div className="aside-inner">
            <div className="logo">
              <img className="logoImage" src="/code-sync.png" alt="logo" />
            </div>
            <div id="type"></div>
            <h3 id="connected">Connected</h3>
            <div id="admin">
              {
                  adminname && adminsocketid ? <Admin username={adminname} />:null 
              }
            </div>
            <div className="clientsList">
            
              {Clients.map((client) => {
                return (
                  <Client key={client.socketId} username={client.username}
                          socketId={client.socketId}  
                          roomId={roomId} socketRef={socketRef.current}
                          adminSocketId={adminsocketid} />
                          
                );
              })}
            </div>
          </div>
           <Button variant='light' className="btn copyBtn" onClick={copyRoomId}>COPY ROOM ID</Button>
           <Button variant='danger' className="btn leaveBtn" onClick={leaveRoom}>Leave</Button>
        </div>
        <div className="editorwrap">
            <Navbars 
                      language={language} 
                      setLanguage={setLanguage} 
                      setCompile={setCompile}
                      setShowloading={setShowloading}
                      langRef={langRef}
                      stopCompiling={stopCompiling}
                  />
            <Editor
                        socketRef={socketRef}
                        username={location.state?.username}
                        roomId={roomId}
                        language={language}
                        codeRef={codeRef}
                        onCodeChange={(code) => {
                            codeRef.current = code;
                        }}
                  />
        </div>
       <div className="right-sidebar">
            <div className="right-inner-sidebar" >
                  <h3>Input</h3>
                  <Form className="output-box"  >
                    <Form.Group controlId="exampleForm.ControlTextarea1">
                      <Form.Control onChange={takeInput} className="output-box-text-area"  as="textarea" 
                                    style={{ backgroundColor: '#282a36' ,
                                    color: 'white', fontSize:'15px'  , 
                                    
                                    }}   />
                      </Form.Group>
                  </Form>
                  { codeRef.current && codeRef.current != '' && language && showloading == 1 ? <Compiling /> : showoutput ? <>
                  <h3>Output</h3>
                  <Form className="output-box"  >
                    <Form.Group controlId="exampleForm.ControlTextarea1">
                      <Form.Control className="output-box-text-area"  as="textarea" 
                                    value={output} style={{  backgroundColor: '#282a36' ,
                                    color: 'white', fontSize:'15px'  ,  
                                     minHeight:"76vh"
                                    }} readOnly />
                      </Form.Group>
                  </Form> </>:null }
            </div> 
            </div>
       
      </div>
    );
  }
};

export default EditorPage;
