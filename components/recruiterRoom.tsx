import { useEffect, useState } from "react";
import { baseUrl } from "@/baseUrl";
import { RootState } from "@/store/store";
import Link from "next/link";
import { useSelector } from "react-redux";
import useSWR,{ useSWRConfig } from "swr";
import styles from '../styles/RoomLayout.module.scss'
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { io } from "socket.io-client";
const socket = io(`${baseUrl}`);


const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NestedLayoutRecruiterRoom({ children }: any) {
  const { mutate } = useSWRConfig();
  const [refreshOnline, setRefreshOnline] = useState("");
  const id = useSelector((state: RootState) => state.session.id);
useEffect(()=>{
  socket.on("onlineUser", (data) => {
    setRefreshOnline(data);
  });
},[socket])

useEffect(()=>{
  mutate(`${baseUrl}/rooms/recruiter/${id}`)
},[refreshOnline])

  const { data, error } = useSWR(`${baseUrl}/rooms/recruiter/${id}`, fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <div className={styles.container}>
      <div className={styles.chatList}>
          {data.map((item: any) => (
            <Link href={`/recruiter/chats/${item.id}`} key={item.id} className={styles.List}>
              <div style={{ position: "relative" }}>
             {
              item.candidate.online&& <div
              style={{
                position: "absolute",
                top: "-1px",
                right:"-2px",
                backgroundColor: "lawngreen",
                height: "8px",
                width:"8px",
                borderRadius:"4px"
              }}
            ></div>
             }
              <AccountCircleIcon/>
              </div>
              <div className={styles.text}>{item.candidate.firstName}</div>
            </Link>
          ))}
      </div>
      <main className={styles.left}>{children}</main>
    </div>
  );
}