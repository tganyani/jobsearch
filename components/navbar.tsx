import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import useOnClickOutside from "@custom-react-hooks/use-click-outside";
import { RootState } from "@/store/store";
import useSWR, { useSWRConfig } from "swr";

import { removeSession, setSession } from "@/store/slice/sessionSlice";

import styles from "../styles/NavBar.module.scss";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ChatIcon from "@mui/icons-material/Chat";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { setAccountType } from "@/store/slice/accountSlice";
import { baseUrl } from "@/baseUrl";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Popover from "@mui/material/Popover";
import Badge from "@mui/material/Badge";
import axios from "axios";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
dayjs.extend(relativeTime);

import { stringToColor } from "./candidateChatsLayout";
import { setUnReadLenght } from "@/store/slice/chatLenghtSlice";
import { setRefreshMessage } from "@/store/slice/refreshNewMsgSlice";

const socket = io(`${baseUrl}`);

export default function NavBar() {
  const { mutate } = useSWRConfig();
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const router = useRouter();
  const userEmail = useSelector((state: RootState) => state.session.email);
  const session = useSelector((state: RootState) => state.session.access_token);
  const user = useSelector((state: RootState) => state.session);
  const unreadCandidateChats = useSelector(
    (state: RootState) => state.unreadChats.unRead
  );
  const refreshNewMsg = useSelector(
    (state: RootState) => state.refreshNewMsg.refreshNewMessage
  );
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );
  const [refreshNotification, setRefreshNotification] = useState(" ");
  const [refreshRecruiterNotification, setRefreshRecruiterNotification] =
    useState(" ");
  const [TabValue, setTabValue] = useState(0);
  const [read, setRead] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  // notification
  const [anchorElNotification, setAnchorElNotification] =
    useState<HTMLButtonElement | null>(null);

  const handleClickNotification = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorElNotification(event.currentTarget);
  };

  const handleCloseNotification = () => {
    setAnchorElNotification(null);
  };

  const openNotification = Boolean(anchorElNotification);
  const idNotification = openNotification ? "simple-popover" : undefined;
  //
  const matches = useMediaQuery("(max-width:600px)");

  const { data: chatList, error: error2 } =
    accountType === "candidate"
      ? useSWR(
          [
            `${baseUrl}/rooms/candidate/${user.id}`,
            user.access_token,
            user.refresh_token,
          ],
          async ([url, access_token, refresh_token]) =>
            await axios
              .get(url, {
                headers: { Authorization: "Bearer " + access_token },
              })
              .then((res) => res.data)
              .catch(async (err) => {
                if (err.request.status === 401) {
                  await axios
                    .post(`${baseUrl}/candidates/refresh`, { refresh_token })
                    .then((res) => {
                      dispatch(
                        setSession({
                          ...user,
                          access_token: res.data.access_token,
                        })
                      );
                      if (!res.data.valid_access_token) {
                        dispatch(removeSession());
                        router.push("/auth/signin");
                      }
                    });
                }
              })
        )
      : useSWR(
          [
            `${baseUrl}/rooms/recruiter/${user.id}`,
            user.access_token,
            user.refresh_token,
          ],
          async ([url, access_token, refresh_token]) =>
            await axios
              .get(url, {
                headers: { Authorization: "Bearer " + access_token },
              })
              .then((res) => res.data)
              .catch(async (err) => {
                if (err.request.status === 401) {
                  await axios
                    .post(`${baseUrl}/recruiter/refresh`, { refresh_token })
                    .then((res) => {
                      dispatch(
                        setSession({
                          ...user,
                          access_token: res.data.access_token,
                        })
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
    const chatsLenght = async () => {
      dispatch(
        setUnReadLenght(
          chatList?.filter(
            (rm: any) =>
              rm.chats.filter(
                (chat: any) =>
                  chat.read === false && chat.accountType !== accountType
              )?.length > 0
          )?.length
        )
      );
    };
    chatsLenght();
  }, [chatList]);
  useEffect(() => {
    const reSize = () => {
      if (!matches) {
        setToggleMenu(false);
      }
    };
    return reSize();
  }, [matches]);

  useEffect(() => {
    socket.on("refreshNotification", (data) => {
      setRefreshNotification(data);
    });
    socket.on("refreshRecruiterNotification", (data) => {
      setRefreshRecruiterNotification(data);
    });
    socket.on("roomMsg", (data) => {
      dispatch(setRefreshMessage(data));
    });
    const sendAllCandidateRooms = () => {
      socket.emit("allRooms", { id: user.id, accountType });
    };
    sendAllCandidateRooms();
  }, [socket]);
  useEffect(() => {
    mutate([
      `${baseUrl}/candidates/notifications/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  }, [refreshNotification]);
  useEffect(() => {
    mutate([
      `${baseUrl}/recruiters/notifications/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  }, [refreshRecruiterNotification]);

  const handleClose = () => {
    setAnchorEl(null);
  };
  const menuRef = useRef(null);
  useOnClickOutside(menuRef, () => {
    setToggleMenu(false);
  });
  const iconsStyle = {
    fontSize: "14px",
    color: "grey",
  };
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  // handle update read notification
  const handleReadNotification = async (Id: number) => {
    await axios
      .patch(`${baseUrl}/candidates/notifications/${Id}`,{data:"empty"}, {
        headers: { Authorization: "Bearer " + user.access_token },
      })
      .then((res) => {})
      .catch(async (err) => {
        if (err.request.status === 401) {
          await axios
            .post(`${baseUrl}/candidates/refresh`, {
              refresh_token: user.refresh_token,
            })
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
      });
    await mutate([
      `${baseUrl}/candidates/notifications/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  };
  const handleReadRecruiterNotification = async (Id: number) => {
    await axios
      .patch(`${baseUrl}/recruiters/notifications/${Id}`,{data:"empty"}, {
        headers: { Authorization: "Bearer " + user.access_token },
      })
      .then((res) => {})
      .catch(async (err) => {
        if (err.request.status === 401) {
          await axios
            .post(`${baseUrl}/recruiters/refresh`, {
              refresh_token: user.refresh_token,
            })
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
      });
    await mutate([
      `${baseUrl}/recruiters/notifications/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  };

  const { data, error } =
    accountType === "candidate"
      ? useSWR(
          [
            `${baseUrl}/candidates/notifications/${user.id}`,
            user.access_token,
            user.refresh_token,
          ],
          async ([url, access_token, refresh_token]) =>
            await axios
              .get(url, {
                headers: { Authorization: "Bearer " + access_token },
              })
              .then((res) => res.data)
              .catch(async (err) => {
                if (err.request.status === 401) {
                  await axios
                    .post(`${baseUrl}/candidates/refresh`, { refresh_token })
                    .then((res) => {
                      dispatch(
                        setSession({
                          ...user,
                          access_token: res.data.access_token,
                        })
                      );
                      if (!res.data.valid_access_token) {
                        dispatch(removeSession());
                        router.push("/auth/signin");
                      }
                    });
                }
              })
        )
      : useSWR(
          [
            `${baseUrl}/recruiters/notifications/${user.id}`,
            user.access_token,
            user.refresh_token,
          ],
          async ([url, access_token, refresh_token]) =>
            await axios
              .get(url, {
                headers: { Authorization: "Bearer " + access_token },
              })
              .then((res) => res.data)
              .catch(async (err) => {
                if (err.request.status === 401) {
                  await axios
                    .post(`${baseUrl}/recruiters/refresh`, { refresh_token })
                    .then((res) => {
                      dispatch(
                        setSession({
                          ...user,
                          access_token: res.data.access_token,
                        })
                      );
                      if (!res.data.valid_access_token) {
                        dispatch(removeSession());
                        router.push("/auth/signin");
                      }
                    });
                }
              })
        );

  return (
    <div className={styles.container} ref={menuRef}>
      <Typography variant="body1" component="div" className={styles.logo}>
        Imisebenzi
      </Typography>
      <div className={styles.menu}>
        <div className={styles.innerMenu}>
          <MenuIcon onClick={() => setToggleMenu(!toggleMenu)} />
        </div>
      </div>
      <div className={styles.navLists}>
        {accountType === "candidate" && (
          <ul className={toggleMenu ? styles.openMenu : styles.list}>
            {session && (
              <li>
                <Link
                  href="/candidate/chats"
                  style={{ textDecoration: "none", color: "white" }}
                  className={styles.link}
                  onClick={() => setToggleMenu(false)}
                >
                  <div className={styles.pContainer}>
                    <Typography
                      variant="body2"
                      component="div"
                      className={styles.p}
                    >
                      inbox
                    </Typography>
                  </div>

                  <div className={styles.iconContainer}>
                    <Badge badgeContent={unreadCandidateChats} color="error">
                      <ChatIcon sx={iconsStyle} className={styles.icon} />
                    </Badge>
                  </div>
                </Link>
              </li>
            )}

            {session && (
              <li>
                <Link
                  href="/"
                  style={{ textDecoration: "none", color: "white" }}
                  className={styles.link}
                  onClick={() => setToggleMenu(false)}
                >
                  <div className={styles.pContainer}>
                    <Typography
                      variant="body2"
                      component="div"
                      className={styles.p}
                    >
                      jobs
                    </Typography>
                  </div>
                  <div className={styles.iconContainer}>
                    <WorkOutlineIcon sx={iconsStyle} className={styles.icon} />
                  </div>
                </Link>
              </li>
            )}
            {session && (
              <li>
                <Link
                  href="/candidate/likedJobs"
                  className={styles.link}
                  style={{ textDecoration: "none", color: "white" }}
                  onClick={() => setToggleMenu(false)}
                >
                  <div className={styles.pContainer}>
                    <Typography
                      variant="body2"
                      component="div"
                      className={styles.p}
                    >
                      favourite
                    </Typography>
                  </div>
                  <div className={styles.iconContainer}>
                    <FavoriteBorderIcon
                      sx={iconsStyle}
                      className={styles.icon}
                    />
                  </div>
                </Link>
              </li>
            )}
            {session && (
              <li>
                <Link
                  href="/candidate/appliedJobs"
                  className={styles.link}
                  style={{ textDecoration: "none", color: "white" }}
                  onClick={() => setToggleMenu(false)}
                >
                  <div className={styles.pContainer}>
                    <Typography
                      variant="body2"
                      component="div"
                      className={styles.p}
                    >
                      applied
                    </Typography>
                  </div>
                  <div className={styles.iconContainer}></div>
                </Link>
              </li>
            )}
            {!session && (
              <li>
                <Link
                  href="/auth/signup"
                  style={{ textDecoration: "none", color: "white" }}
                  className={styles.link}
                  onClick={() => setToggleMenu(false)}
                >
                  <div className={styles.pContainer}>
                    <Typography
                      variant="body2"
                      component="div"
                      className={styles.p}
                    >
                      signup
                    </Typography>
                  </div>
                  <div className={styles.iconContainer}></div>
                </Link>
              </li>
            )}
          </ul>
        )}
        {accountType === "recruiter" && (
          <ul className={toggleMenu ? styles.openMenu : styles.list}>
            {session && (
              <li>
                <Link
                  href="/recruiter/chats"
                  style={{ textDecoration: "none", color: "white" }}
                  className={styles.link}
                  onClick={() => setToggleMenu(false)}
                >
                  <div className={styles.pContainer}>
                    <Typography
                      variant="body2"
                      component="div"
                      className={styles.p}
                    >
                      inbox
                    </Typography>
                  </div>
                  <div className={styles.iconContainer}>
                    <Badge badgeContent={unreadCandidateChats} color="error">
                      <ChatIcon sx={iconsStyle} className={styles.icon} />
                    </Badge>
                  </div>
                </Link>
              </li>
            )}
            {session && (
              <li>
                <Link
                  href="/recruiter/vaccancy/allVaccancies"
                  style={{ textDecoration: "none", color: "white" }}
                  className={styles.link}
                  onClick={() => setToggleMenu(false)}
                >
                  <div className={styles.pContainer}>
                    <Typography
                      variant="body2"
                      component="div"
                      className={styles.p}
                    >
                      vaccanciesPosted
                    </Typography>
                  </div>
                  <div className={styles.iconContainer}></div>
                </Link>
              </li>
            )}
            {session && (
              <li>
                <Link
                  href="/recruiter/vaccancy"
                  style={{ textDecoration: "none", color: "white" }}
                  className={styles.link}
                  onClick={() => setToggleMenu(false)}
                >
                  <div className={styles.pContainer}>
                    <Typography
                      variant="body2"
                      component="div"
                      className={styles.p}
                    >
                      post job
                    </Typography>
                  </div>
                  <div className={styles.iconContainer}></div>
                </Link>
              </li>
            )}
            {!session && (
              <li>
                <p>
                  <Link
                    href="/auth/signup"
                    style={{ textDecoration: "none", color: "white" }}
                    className={styles.link}
                    onClick={() => setToggleMenu(false)}
                  >
                    <div className={styles.pContainer}>
                      <Typography
                        variant="body2"
                        component="div"
                        className={styles.p}
                      >
                        signup
                      </Typography>
                    </div>
                    <div className={styles.iconContainer}></div>
                  </Link>
                </p>
              </li>
            )}
          </ul>
        )}
        {session && (
          <div className={styles.notifications}>
            <Button
              sx={{
                textDecoration: "none",
                color: "white",
                textTransform: "lowercase",
                padding: "0px",
                background: "inherit",
                boxShadow: 0,
                textAlign: "left",
                "&:hover": {
                  background: "inherit",
                  boxShadow: 0,
                },
              }}
              size="small"
              aria-describedby={idNotification}
              variant="contained"
              onClick={handleClickNotification}
            >
              <Badge
                badgeContent={
                  data?.notifications?.filter(
                    (notification: any) => notification.read === false
                  )?.length
                }
                color="error"
                sx={{ color: "lawngreen" }}
              >
                <NotificationsNoneIcon
                  sx={{ fontSize: "20px", color: "grey" }}
                />
              </Badge>
            </Button>
            <Popover
              id={idNotification}
              open={openNotification}
              anchorEl={anchorElNotification}
              onClose={handleCloseNotification}
              elevation={1}
              disableScrollLock={true}
              anchorOrigin={{
                vertical: 45,
                horizontal: "left",
              }}
              sx={{ height: "500px" }}
            >
              <div>
                <Tabs
                  value={TabValue}
                  onChange={handleTabChange}
                  aria-label="disabled tabs example"
                  TabIndicatorProps={{
                    style: { background: "lawngreen" },
                  }}
                >
                  <Tab
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: "400",
                      "&.Mui-selected": {
                        color: "lawngreen",
                      },
                    }}
                    label="all"
                    onClick={() => setRead(true)}
                  />
                  <Tab
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: "400",
                      "&.Mui-selected": {
                        color: "lawngreen",
                      },
                    }}
                    label="uread"
                    onClick={() => setRead(false)}
                  />
                </Tabs>
              </div>
              {accountType === "recruiter" ? (
                <List
                  sx={{
                    width: "100%",
                    maxwidth: 360,
                    bgcolor: "background.paper",
                  }}
                >
                  {data?.notifications
                    ?.filter(
                      (notification: any) =>
                        notification.read === read || read === true
                    )
                    ?.map((notification: any) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          router.push(
                            `/recruiter/vaccancy/${notification.jobId}`
                          );
                          setAnchorElNotification(null);
                          handleReadRecruiterNotification(
                            Number(notification.id)
                          );
                        }}
                      >
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            backgroundColor:
                              notification?.read === true ? "white" : "#eeeeee",
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: stringToColor(notification?.firstName),
                              }}
                            >
                              {notification?.firstName?.toUpperCase()[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography component="span" variant="body1">
                                Job application
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography
                                  sx={{ display: "inline" }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {notification?.firstName}{" "}
                                  {notification?.lastName}-
                                </Typography>
                                {notification.jobTitle}
                                <Typography
                                  component="div"
                                  variant="body2"
                                  color="text.primary"
                                  sx={{ fontSize: 12 }}
                                >
                                  {dayjs(notification.dateCreated).fromNow()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </div>
                    ))}
                </List>
              ) : (
                <List
                  sx={{
                    width: "100%",
                    maxwidth: 360,
                    bgcolor: "background.paper",
                  }}
                >
                  {data?.notifications
                    ?.filter(
                      (notification: any) =>
                        notification.read == read || read === true
                    )
                    ?.map((notification: any) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          router.push(
                            `/candidate/chats/${notification.roomId}`
                          );
                          setAnchorElNotification(null);
                          handleReadNotification(Number(notification.id));
                        }}
                      >
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            backgroundColor:
                              notification?.read === true ? "white" : "#eeeeee",
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: stringToColor(
                                  notification.companyName
                                ),
                              }}
                            >
                              {notification.companyName?.toUpperCase()[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography
                                component="span"
                                variant="body1"
                                sx={{
                                  color:
                                    notification?.invitation === true
                                      ? "lawngreen"
                                      : "tomato",
                                }}
                              >
                                {notification?.invitation === true
                                  ? notification?.proposal
                                    ? "Proposal"
                                    : "Invitation"
                                  : "Refusal"}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography
                                  sx={{ display: "inline" }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {notification.jobTitle}-
                                </Typography>
                                {notification.companyName}
                                <Typography
                                  component="div"
                                  variant="body2"
                                  color="text.primary"
                                  sx={{ fontSize: 12 }}
                                >
                                  {dayjs(notification.dateCreated).fromNow()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </div>
                    ))}
                </List>
              )}
            </Popover>
          </div>
        )}
        <div className={styles.account}>
          <div className={styles.dropDown}>
            <Button
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
            >
              <AccountCircleIcon id={styles.accountIcon} />
            </Button>
          </div>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
            elevation={0.5}
          >
            {session && (
              <MenuItem>
                <Typography
                  sx={{
                    color: "lawngreen",
                  }}
                  variant="body2"
                  component="div"
                >
                  {userEmail}
                </Typography>
              </MenuItem>
            )}
            {!session && (
              <MenuItem
                onClick={() => {
                  handleClose();
                  router.push("/");
                }}
              >
                <Typography variant="body2" component="div">
                  login
                </Typography>
                <LoginIcon sx={{ fontSize: "14px", color: "lawngreen" }} />
              </MenuItem>
            )}
            {session && (
              <div>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    socket.emit("offline", { accountType, id: user.id });
                    dispatch(removeSession());
                    router.push("/");
                    Cookies.remove("user");
                  }}
                  sx={{
                    display: "flex",
                    flexFlow: "row nowrap",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2" component="div">
                    logout
                  </Typography>
                  <LogoutIcon sx={{ fontSize: "14px", color: "tomato" }} />
                </MenuItem>
                {accountType === "candidate" && (
                  <MenuItem
                    onClick={() => {
                      router.push("/candidate");
                      handleClose();
                    }}
                    sx={{
                      display: "flex",
                      flexFlow: "row nowrap",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2" component="div">
                      profile
                    </Typography>

                    <PersonOutlineIcon
                      sx={{ fontSize: "14px", color: "grey" }}
                    />
                  </MenuItem>
                )}

                {accountType === "recruiter" && (
                  <MenuItem
                    onClick={() => {
                      router.push("/recruiter");
                      handleClose();
                    }}
                    sx={{
                      display: "flex",
                      flexFlow: "row nowrap",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2" component="div">
                      profile
                    </Typography>
                    <PersonOutlineIcon
                      sx={{ fontSize: "14px", color: "grey" }}
                    />
                  </MenuItem>
                )}

                <MenuItem
                  onClick={handleClose}
                  // sx={{
                  //   display: "flex",
                  //   flexFlow: "row nowrap",
                  //   justifyContent: "space-between",
                  // }}
                >
                  {" "}
                  {accountType === "recruiter" ? (
                    <li
                      onClick={() => {
                        dispatch(removeSession());
                        dispatch(setAccountType("candidate"));
                        router.push("/auth/signin");
                      }}
                      style={{
                        display: "flex",
                        flexFlow: "row nowrap",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography color="black" variant="body2" component="div">
                        candidate profile
                      </Typography>
                      <ArrowRightAltIcon
                        sx={{ fontSize: "14px", color: "grey" }}
                      />
                    </li>
                  ) : (
                    <li
                      onClick={() => {
                        dispatch(removeSession());
                        dispatch(setAccountType("recruiter"));
                        router.push("/auth/signin");
                      }}
                      style={{
                        display: "flex",
                        flexFlow: "row nowrap",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography color="black" variant="body2" component="div">
                        recruiter profile
                      </Typography>
                      <ArrowRightAltIcon
                        sx={{ fontSize: "14px", color: "grey" }}
                      />
                    </li>
                  )}
                </MenuItem>
              </div>
            )}
          </Menu>
        </div>
      </div>
    </div>
  );
}
