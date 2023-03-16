import { useEffect, useState } from "react";
import { useRouter } from 'next/router'
import { baseUrl } from "@/baseUrl";
import { RootState } from "@/store/store";
import Link from "next/link";
import { useSelector } from "react-redux";
import useSWR,{ useSWRConfig } from "swr";
import styles from '../styles/RoomLayout.module.scss'
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { io } from "socket.io-client";

import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import calendar from "dayjs/plugin/calendar";
dayjs.extend(calendar);
dayjs.extend(localizedFormat);

const socket = io(`${baseUrl}`);


const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NestedLayoutRecruiterRoom({ children }: any) {

  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );
  const refreshNewMsg = useSelector((state:RootState)=>state.refreshNewMsg.refreshNewMessage)
  const router = useRouter()
  const { mutate } = useSWRConfig();
  const [refreshOnline, setRefreshOnline] = useState("");
  const id = useSelector((state: RootState) => state.session.id);

  const { data, error } = useSWR(`${baseUrl}/rooms/recruiter/${id}`, fetcher);

useEffect(()=>{
  socket.on("onlineUser", (data) => {
    setRefreshOnline(data);
  });
},[socket])

useEffect(()=>{
  mutate(`${baseUrl}/rooms/recruiter/${id}`)
},[refreshOnline])

useEffect(()=>{
  mutate(`${baseUrl}/rooms/recruiter/${id}`)
},[refreshNewMsg])

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <div className={styles.container}>
      <div className={styles.chatList}>
          {data.map((item: any) => (
            <Link href={`/recruiter/chats/${item.id}`} key={item.id} className={router.asPath===`/recruiter/chats/${item.id}`?styles.active:styles.List}>
              <div style={{ position: "relative" }}>
             {
              item.candidate.online&& <div
              style={{
                position: "absolute",
                top: "3px",
                right:"0px",
                backgroundColor: "lawngreen",
                height: "8px",
                width:"8px",
                borderRadius:"4px"
              }}
            ></div>
             }
              {item.candidate.image ? (
                <img
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "20px",
                  }}
                  src={`${baseUrl}${item.candidate.image}`}
                />
              ) : (
                <AccountCircleIcon style={{ fontSize: "40px" }} />
              )}
              </div>
              <div className={styles.text}>

              <div
                style={{
                  display: "flex",
                  flexFlow: "row nowrap",
                  justifyContent: "space-between",
                }}
              >
                <p className={styles.name}>{item.candidate.firstName} </p>
                <span
                  style={{
                    fontWeight: "400",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    width: "80px",
                    marginRight: "5px",
                  }}
                >
                  {dayjs(item?.chats[0]?.dateCreated).format("LL")}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexFlow: "row nowrap",
                  justifyContent: "space-between",
                }}
              >
                <p className={styles.lastMsg}>{item?.chats[0]?.message}</p>
                <span
                  style={{
                    width: "80px",
                    display: "flex",
                    flexFlow: "row nowrap",
                    justifyContent: "space-between",
                  }}
                >
                  <p style={{ width: "40px" }}>
                    {item?.chats[0]?.accountType === accountType &&
                      !item?.chats[0]?.read && (
                        <DoneIcon style={{ fontSize: "14px", color: "grey" }} />
                      )}
                    {item?.chats[0]?.accountType === accountType &&
                      item?.chats[0]?.read && (
                        <DoneAllIcon
                          style={{ fontSize: "14px", color: "lawngreen" }}
                        />
                      )}
                  </p>
                  {
                    (item?.chats.filter((chat:any)=>(chat.read === false&& chat.accountType!==accountType)).length>0)&&<div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexFlow: "row nowrap",
                      backgroundColor: "lawngreen",
                      width: "30px",
                      height: "30px",
                      borderRadius: "15px",
                      color: "white",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {
                      item?.chats.filter((chat:any)=>chat.read === false&& chat.accountType!==accountType).length
                    }
                    
                  </div>
                  }
                  
                </span>
              </div>
              </div>
            </Link>
          ))}
      </div>
      <main className={styles.left}>{children}</main>
    </div>
  );
}