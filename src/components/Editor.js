import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import '../css/EditorPage.css';
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import 'codemirror/mode/clike/clike';
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Action";

const Editor = ({ socketRef, roomId, onCodeChange, username , codeRef , language }) => {

  const editorRef = useRef(null)
  useEffect(() => {
    async function init() {
      console.log(language)
      let language_mode = "javascript"                  //Default javascript
      if( language == "c")
      {
        language_mode = "text/x-csrc" ;
      }
      else if ( language == "cpp")
      {
        language_mode = "text/x-c++src" ;
      }
      else if( language == "python3" || language == "python2")
      {
        language_mode = "python" ;
      }
      else if( language == "java" )
      {
        language_mode ='text/x-java' ;
      }

      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        { 
          mode: { name : language_mode  },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          
        }
      );

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          } , { passive: true } );
          
           
           editorRef.current.on('keyup',()=>{
            
            socketRef.current.emit("typing", {
              username,
            } , {
              passive: true
            });

            setTimeout(()=>{
                socketRef.current.emit("typing",{
                    
                     username:"",
                });

            },500)

           })     
        }
      });
    }

    init();
     
  }, []);

  useEffect(() => {


    if (socketRef.current) {

      socketRef.current.on(ACTIONS.SYNC_CODE,({socketId})=> {

        socketRef.current.emit(ACTIONS.SYNC_CODE, {
             socketId , 
             roomId ,
             code : codeRef.current
        });
      })
      
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });

    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };

  },[socketRef.current]);

  return <textarea id="realtimeEditor" ></textarea>;
};

export default Editor;
