import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { baseUrl } from "@/baseUrl";
import { RootState } from "@/store/store";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import useSWR, { useSWRConfig } from "swr";
import styles from "../styles/RoomLayout.module.scss";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { io } from "socket.io-client";

import Avatar from "@mui/material/Avatar";
import { Typography } from "@mui/material";

import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import calendar from "dayjs/plugin/calendar";
import axios from "axios";

import { stringToColor } from "./candidateChatsLayout";

dayjs.extend(calendar);
dayjs.extend(localizedFormat);

const socket = io(`${baseUrl}`);

export default function NestedLayoutRecruiterRoom({ children }: any) {
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );
  const dispatch = useDispatch();
  const refreshNewMsg = useSelector(
    (state: RootState) => state.refreshNewMsg.refreshNewMessage
  );
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [refreshOnline, setRefreshOnline] = useState("");
  const user = useSelector((state: RootState) => state.session);

  const { data, error } = useSWR(
    [
      `${baseUrl}/rooms/recruiter/${user.id}`,
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
    socket.on("onlineUser", (data) => {
      setRefreshOnline(data);
    });
  }, [socket]);

  useEffect(() => {
    mutate([
      `${baseUrl}/rooms/recruiter/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  }, [refreshOnline]);

  useEffect(() => {
    mutate([
      `${baseUrl}/rooms/recruiter/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  }, [refreshNewMsg]);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <div className={styles.container}>
      <div className={styles.chatList}>
        {data.map((item: any) => (
          <Link
            href={`/recruiter/chats/${item.id}`}
            key={item.id}
            className={
              router.asPath === `/recruiter/chats/${item.id}`
                ? styles.active
                : styles.List
            }
          >
            <div style={{ position: "relative" }}>
              {item.candidate.online && (
                <div
                  className={styles.onlineIndicator}
                  style={{
                    position: "absolute",
                    top: "3px",
                    right: "0px",
                    backgroundColor: "lawngreen",
                    height: "8px",
                    width: "8px",
                    borderRadius: "4px",
                    zIndex: "3",
                  }}
                ></div>
              )}
              {item.candidate.image ? (
                <Avatar
                  alt={item.candidate?.firstName}
                  src={`${baseUrl}${item.candidate.image}`}
                />
              ) : (
                <Avatar
                  sx={{ bgcolor: stringToColor(item.candidate?.firstName) }}
                >
                  {item.candidate?.firstName?.toUpperCase()[0]}
                </Avatar>
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
                <Typography
                  variant="body1"
                  component="div"
                  className={styles.name}
                  color="text.secondary"
                  sx={{ textTransform: "capitalize" }}
                >
                  {" "}
                  {item.candidate.firstName}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontWeight: "400",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                    width: "80px",
                    marginRight: "5px",
                  }}
                >
                  {dayjs(item?.chats[0]?.dateCreated).format("LL")}
                </Typography>
              </div>
              <div
                style={{
                  display: "flex",
                  flexFlow: "row nowrap",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  className={styles.lastMsg}
                >
                  {item?.chats[0]?.message}
                </Typography>
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
                  {item?.chats.filter(
                    (chat: any) =>
                      chat.read === false && chat.accountType !== accountType
                  ).length > 0 && (
                    <div
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
                        item?.chats.filter(
                          (chat: any) =>
                            chat.read === false &&
                            chat.accountType !== accountType
                        ).length
                      }
                    </div>
                  )}
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
