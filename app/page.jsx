"use client";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import { EllipsisVertical, Loader, LogOut, Search } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [login, setLogin] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState("");
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    socket.connected ? setIsConnected(true) : socket.on("connect", () => setIsConnected(true));
  }, []);

  useEffect(() => {
    setMsgs([]);
  }, [selectedChat]);

  const register = async (e) => {
    e.preventDefault();
    try {
      if (!socket.connected) socket.connect();
      socket.emit("register", username);
    } catch (error) {
      toast.error("Something went wrong.");
    }
  }

  useEffect(() => {
    socket.on("response", (response) => {
      toast[response.status](response.msg);
      if (response.status === "success") setLogin(true);
    })
    socket.on("chat", (res) => {
      setMsgs((prev) => [...prev, res]);
    })
  }, []);

  useEffect(() => {
    socket.on("chats", (users) => {
      setChats(users.filter(u => u.username !== username));
    })
  }, [username]);

  const sendMsg = (e) => {
    e.preventDefault();
    const m = msg.trim();
    if (m.length) {
      const o = { from: username, to: selectedChat, msg: m };
      setMsgs((prev) => [...prev, o]);
      socket.emit("chat", o);
      setMsg("");
    }
  }

  return (
    <div className="body">
      {
        login ? <>
          <div className="chats">
            <div className="profile">
              <div className="col">
                <div className="avatar">{username.split("")[0]}</div>
                <div className="row">
                  <h4>Spookie</h4>
                  <p>@{username}</p>
                </div>
              </div>
              <div className="col">
                <LogOut onClick={() => { setLogin(false); setUsername(""); socket.disconnect() }} />
              </div>
            </div>
            <div className="search">
              <Search />
              <input type="text" placeholder="Search" />
            </div>
            <div className="onchats">
              {
                chats.map((chat, i) => (
                  <div key={i} className={`chat ${selectedChat === chat.username ? "active" : "inactive"}`} onClick={() => { setSelectedChat(chat.username) }}>
                    <div className="col">
                      <div className="avatar">{chat.username.split("")[0]}</div>
                      <div className="row">
                        <h4>{chat.username}</h4>
                        <p>Hi, I'm using spookie.</p>
                      </div>
                    </div>
                    <div className="col">
                      <EllipsisVertical />
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          <div className="chatbox bx">
            {
              selectedChat === "" ? <></> :
                <>
                  <div className="head">
                    <div className="avatar">{selectedChat.split("")[0]}</div>
                    <h4>{selectedChat}</h4>
                  </div>
                  <div className="content">
                    {
                      msgs.map((m, i) => (
                        <div className={`msg ${m.from === username ? "from" : "to"}`} key={i}><div className="c">{m.msg}</div></div>
                      ))
                    }
                  </div>
                  <form onSubmit={sendMsg}>
                    <input type="text" placeholder="Write message here" value={msg} onChange={(e) => { setMsg(e.target.value); }} />
                  </form>
                </>
            }
          </div>
        </> :
          <div className="auth bx">
            {
              isConnected ?
                <form onSubmit={register}>
                  <input type="text" placeholder="username" value={username} onChange={(e) => {
                    const u = e.target.value.toLowerCase().replaceAll(" ", "");
                    if (u.length) {
                      if (/^[A-Za-z0-9]+$/.test(u) && u.length < 30) setUsername(u)
                    } else {
                      setUsername(u)
                    }
                  }} />
                </form> :
                <div className="connecting"><Loader /> <p>Connecting to server</p></div>
            }
          </div>
      }
    </div>
  );
}