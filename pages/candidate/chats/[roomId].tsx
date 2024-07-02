import { ReactElement, useRef } from "react";
import NestedLayout from "@/components/candidateRoomLayout";
import { NextPageWithLayout } from "@/pages/_app";
import styles from "../../../styles/ChatFrame.module.scss";

import { setRefreshMessage } from "@/store/slice/refreshNewMsgSlice";

import { useEffect, useState } from "react";
import { baseUrl } from "@/baseUrl";
import { useRouter } from "next/router";
import useSWR, { useSWRConfig } from "swr";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import { RootState } from "@/store/store";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import DoneIcon from "@mui/icons-material/Done";
import SendIcon from "@mui/icons-material/Send";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import calendar from "dayjs/plugin/calendar";
import axios from "axios";
import { Typography } from "@mui/material";


dayjs.extend(calendar);

dayjs.extend(localizedFormat);

// const fetcher = (url: string) => fetch(url).then((res) => res.json());
const socket = io(`${baseUrl}`);

const Chat: NextPageWithLayout = () => {
  const dispatch = useDispatch();
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );
  const { mutate } = useSWRConfig();
  const [message, setMessage] = useState<string>("");
  const [response, setResponse] = useState();
  const [refreshRead, setRefreshRead] = useState("");
  const [refreshOnline, setRefreshOnline] = useState("");
  const [typing, setTyping] = useState<boolean>(false);
  const [unSendMsg, setUnsendMsg] = useState<{ msg: string; date: string }[]>(
    []
  );
  const user = useSelector((state: RootState) => state.session);
  const scrollMessage = useRef<null | HTMLDivElement>(null);
  const router = useRouter();
  // const { data, error } = useSWR(
  //   `${baseUrl}/rooms/${router.query.roomId}`,
  //   fetcher
  // );

  const { data, error } = useSWR(
    [
      `${baseUrl}/rooms/${router.query.roomId}`,
      user.access_token,
      user.refresh_token,
    ],
    async ([url, access_token, refresh_token]) =>
      await axios
        .get(url, { headers: { Authorization: "Bearer " + access_token } })
        .then((res) => res.data)
        .catch(async (err) => {
          if (err.request.status === 401) {
            await axios
              .post(`${baseUrl}/candidates/refresh`, { refresh_token })
              .then((res) => {
                dispatch(
                  setSession({ ...user, access_token: res.data.access_token })
                );
                if (!res.data.valid_access_token) {
                  dispatch(removeSession());
                  router.push("/auth/signin");
                }
              });
          }
        })
  );

  useEffect(() => {
    socket.emit("joinRoom", { roomName: data?.name });
    socket.emit("read", {
      roomName: data?.name,
      roomId: router.query.roomId,
      accountType,
    });
  }, [data]);
  useEffect(() => {
    socket.on("roomMsg", (data) => {
      setResponse(data);
      setUnsendMsg([]);
      dispatch(setRefreshMessage(data));
    });
    socket.on("refreshRead", (data) => {
      setRefreshRead(data);
      dispatch(setRefreshMessage(data));
    });
    socket.on("onlineUser", (data) => {
      setRefreshOnline(data);
      dispatch(setRefreshMessage(data));
    });
    socket.on("typingUser", (data) => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
      }, 4000);
    });
  }, [socket]);
  useEffect(() => {
    mutate([
      `${baseUrl}/rooms/${router.query.roomId}`,
      user.access_token,
      user.refresh_token,
    ]);
    socket.emit("read", {
      roomName: data?.name,
      roomId: router.query.roomId,
      accountType,
    });
  }, [response]);
  useEffect(() => {
    mutate([
      `${baseUrl}/rooms/${router.query.roomId}`,
      user.access_token,
      user.refresh_token,
    ]);
  }, [refreshRead, refreshOnline]);
  useEffect(() => {
    scrollMessage.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [data, unSendMsg]);
  const handleSend = async () => {
    await setUnsendMsg((prev: any) => [
      ...prev,
      { msg: message, date: new Date() },
    ]);
    await socket.emit("newMsg", {
      message,
      roomId: router.query.roomId,
      roomName: data.name,
      accountType,
    });
    await setMessage("");
  };

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  console.log(data);
  return (
    <div className={styles.main}>
      {typing}
      <div
        style={{
          // color: "green",
          fontStyle: "italic",
          textAlign: "center",
          fontSize: "14px",
        }}
      >
        {!data.recruiter.online && (
          <Typography variant="body2" component="div">
            {data.recruiter.firstName},{"  "}last seen{" "}
            {dayjs(data.recruiter.lastSeen).calendar(null, {
              sameDay: "[Today at] h:mm A",
              lastDay: "[Yesterday]",
              lastWeek: "[Last] dddd",
              sameElse: "DD/MM/YYYY",
            })}
          </Typography>
        )}
        {data.recruiter.online && (
          <Typography
            variant="body2"
            component="div"
            style={{ color: "lawngreen" }}
          >
            <span style={{ color: "grey" }}>{data.recruiter.firstName}</span>,
            {typing ? "typing..." : "online"}
          </Typography>
        )}
      </div>
      <div className={styles.chatBox}>
        {data?.chats.map((item: any, i: number) => (
          <div key={item.id}>
            <div
              style={{
                display: "flex",
                flexFlow: "row nowrap",
                justifyContent: "center",
                marginTop: "12px",
              }}
            >
              {i > 0 &&
              data?.chats[i - 1].dateCreated.split("T")[0] ===
                item.dateCreated.split("T")[0] ? (
                " "
              ) : (
                <Typography variant="body2" sx={{fontSize:"12px"}} color="text.secondary" component="div">
                {dayjs(item.dateCreated).format("LL")}
              </Typography>
              )}
            </div>
            <div
              className={
                item.accountType === accountType ? styles.you : styles.friend
              }
            >
              <Typography variant="body2" color="text.secondary" component="div">
              {item?.message.split(" ").map((word:string) => word.startsWith("http")?<a style={{marginLeft:"2px",marginRight:"2px"}} href={word}>{word}</a>:(word+ " "))}
              </Typography>
              <div
                style={{
                  display: "flex",
                  flexFlow: "row nowrap",
                  justifyContent: "space-between",
                }}
              >
                {" "}
                <p style={{ fontSize: "13px", color: "grey",textTransform:"lowercase" }}>
                  {dayjs(item.dateCreated).format("LT")}
                </p>
                {item.accountType === accountType && !item.read && (
                  <DoneIcon style={{ fontSize: "14px", color: "grey" }} />
                )}
                {item.accountType === accountType && item.read && (
                  <DoneAllIcon
                    style={{ fontSize: "14px", color: "lawngreen" }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollMessage}>
          {unSendMsg.map((msg: { msg: string; date: string }, i: number) => (
            <div className={styles.you} key={i}>
              <p>{msg.msg}</p>
              <div
                style={{
                  display: "flex",
                  flexFlow: "row nowrap",
                  justifyContent: "space-between",
                }}
              >
                {" "}
                <p style={{ fontSize: "13px", color: "grey" }}>
                  {dayjs(msg.date).format("LT")}
                </p>
                <AutorenewIcon style={{ fontSize: "14px", color: "grey" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.inputBox}>
      <div className={styles.inputContainer}>
        <textarea 
          placeholder="type something"
          rows={message?8:2}
          value={message}
          onChange={(e) =>{ 
            setMessage(e.target.value)
            socket.emit("typing",{roomName: data?.name})
          }}
          style={{textAlign:message?"left":"center",fontFamily:"Roboto"}}
          >
         
        </textarea>
        </div>
        {message && (
          <div className={styles.sendBtn}>
            <SendIcon
              style={{ fontSize: "30px", color: "grey" }}
              onClick={handleSend}
            />
          </div>
        )}
      </div>
    </div>
  );
};

Chat.getLayout = function getLayout(page: ReactElement) {
  return <NestedLayout>{page}</NestedLayout>;
};

export default Chat;
