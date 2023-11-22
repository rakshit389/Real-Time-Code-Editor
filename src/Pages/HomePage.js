import React from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import Preloader from "../components/Preloader";

const HomePage = () => {
  const navigate = useNavigate();
  const [Loading, setLoading] = useState(true);
  let [roomId, setRoomId] = useState("");
  let [username, setUsername] = useState("");

  useEffect(() => {
      
      setTimeout(()=>{
            setLoading(false);
      },1000)
      
  }, []);

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Created a new room");
  };

  const joinRoom = () => {

    const regexPattern1 =  /^.{5,}$/ ;
    const regexPattern2 = /^[a-zA-Z0-9]{5,}$/ ;
    roomId = roomId.trim()
    username = username.trim()
    if( !roomId && !username )
    {
      toast.error("Room Id and Username Required");
      return ;
    }
    if (!roomId || !roomId.match(regexPattern1) ) {
      toast.error("Room Id Should Contain Minimum 5 Characters");
      return;
    }
    if (!username || !username.match(regexPattern2) ) {
      toast.error("Username Should Contain Minimum 5 Alphanumeric word");
      return;
    }
    // Redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username
      },
    });
  };

  const handleInputEnter = (e) => {
    if (e.key === "Enter") {
      joinRoom();
    }
  };

  if (Loading) {
    return <Preloader />;
  } else {
    return (
      <div className="HomePageWrapper">
        <div className="FormWrapper">
          <img src="/code-sync.png" alt="CodeImage" className="HomePageLogo" />
          <h4 className="MainLabel">Paste Invitation Room Id</h4>

          <div className="InputGroup">
            <input
              type="text"
              className="InputBox"
              placeholder="Room Id"
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
              onKeyUp={handleInputEnter}
            />

            <input
              type="text"
              className="InputBox"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              onKeyUp={handleInputEnter}
            />

            <Button variant='success' className="btn btn-success joinBtn" onClick={joinRoom}>
              Join
            </Button>

            <span className="createInfo">
              if you don't have invite then create &nbsp;
              <a href="#sf" className="createNewBtn" onClick={createNewRoom}>
                new room
              </a>
            </span>
          </div>
        </div>

        <footer className="footer">
          <h4>
            Created By{" "}
            <a
              className="footer-name"
              href=""
            >
              Rakshit Upadhyay
            </a>{" "}
          </h4>
        </footer>
      </div>
    );
  }
};

export default HomePage;
