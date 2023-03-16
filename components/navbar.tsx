import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { RootState } from "@/store/store";

import { removeSession } from "@/store/slice/sessionSlice";

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
import Cookies from 'js-cookie'

const socket = io(`${baseUrl}`);

export default function NavBar() {
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const router = useRouter();
  const userEmail = useSelector((state: RootState) => state.session.email);
  const session = useSelector((state: RootState) => state.session.access_token);
  const id = useSelector((state:RootState)=>state.session.id)
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.logo}>Imisebenzi</div>
        <div className={styles.menu}>
          <MenuIcon onClick={() => setToggleMenu(!toggleMenu)} />
        </div>
        <div className={styles.navLists}>
          {accountType === "candidate" && (
            <ul className={styles.list}>
              <li>
                <Link
                  href="/candidate/chats"
                  style={{ textDecoration: "none" , color: "white"}}
                >
                  <p>inbox</p>
                </Link>
                <ChatIcon />
              </li>
              <li>
                <p>notifications</p>
                <NotificationsNoneIcon />
              </li>
              <li>
                <p>
                  <Link
                    href="/"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    jobs
                  </Link>
                </p>
                <WorkOutlineIcon />
              </li>
              <li>
                <Link
                  href="/candidate/likedJobs"
                  style={{ textDecoration: "none" , color: "white"}}
                >
                  <p>favourite</p>
                </Link>
                <FavoriteBorderIcon />
              </li>
              <li>
                <p>
                  <Link
                    href="/candidate/appliedJobs"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    applied
                  </Link>
                </p>
              </li>
              {!session && (
                <li>
                  <p>
                    <Link
                      href="/auth/signup"
                      style={{ textDecoration: "none", color: "white" }}
                    >
                      signup
                    </Link>
                  </p>
                </li>
              )}
            </ul>
          )}
          {accountType === "recruiter" && (
            <ul className={styles.list}>
              <li>
                <Link
                  href="/recruiter/chats"
                  style={{ textDecoration: "none", color: "white" }}
                >
                  <p>inbox</p>
                </Link>
                <ChatIcon />
              </li>
              <li>
                <p>notifications</p>
                <NotificationsNoneIcon />
              </li>
              <li>
                <p>
                  <Link
                    href="/recruiter/vaccancy/allVaccancies"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    vaccanciesPosted
                  </Link>
                </p>
              </li>
              <li>
                <p>
                  <Link
                    href="/recruiter/vaccancy"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    post job
                  </Link>
                </p>
              </li>
              {!session && (
                <li>
                  <p>
                    <Link
                      href="/auth/signup"
                      style={{ textDecoration: "none", color: "white" }}
                    >
                      signup
                    </Link>
                  </p>
                </li>
              )}
            </ul>
          )}
          <div className={styles.account}>
            <p style={{ color: "lawngreen" }}>{userEmail}</p>
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
            >
              {!session&&<MenuItem onClick={handleClose}>
                <li
                  onClick={() => {
                    router.push("/");
                  }}
                >
                  login
                </li>
              </MenuItem>}
              {session&&<div><MenuItem onClick={handleClose}>
                <li
                  onClick={() => {
                    socket.emit("offline",{accountType,id})
                    dispatch(removeSession());
                    router.push("/");
                    Cookies.remove('user')
                  }}
                >
                  logout
                </li>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                {accountType === "candidate" && (
                  <li>
                    <Link href="/candidate" style={{ textDecoration: "none" }}>
                      profile
                    </Link>
                  </li>
                )}
                {accountType === "recruiter" && (
                  <li>
                    <Link href="/recruiter" style={{ textDecoration: "none" }}>
                      profile
                    </Link>
                  </li>
                )}
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <li>
                  {" "}
                  {accountType === "recruiter" ? (
                    <li onClick={() => dispatch(setAccountType("candidate"))}>
                      <Link
                        href="/auth/signin"
                        style={{ textDecoration: "none" }}
                      >
                        candidate profile
                      </Link>
                    </li>
                  ) : (
                    <li onClick={() => dispatch(setAccountType("recruiter"))}>
                      <Link
                        href="/auth/signin"
                        style={{ textDecoration: "none" }}
                      >
                        recruiter profile
                      </Link>
                    </li>
                  )}
                </li>
              </MenuItem></div>}
            </Menu>
          </div>
        </div>
      </div>
      <div className={toggleMenu ? styles.toggleMenu : styles.closeMenu}>
        {accountType === "candidate" && (
          <ul className={styles.listToggle}>
            <li onClick={() => setToggleMenu(false)}>
              <Link
                href="/candidate/chats"
                style={{ textDecoration: "none", color: "white" }}
              >
                <p>inbox</p>
              </Link>
              <ChatIcon />
            </li>
            <li onClick={() => setToggleMenu(false)}>
              <p>notifications</p>
              <NotificationsNoneIcon />
            </li>
            <li onClick={() => setToggleMenu(false)}>
              <p>
                <Link
                  href="/"
                  style={{ textDecoration: "none", color: "white" }}
                >
                  jobs
                </Link>
              </p>
              <WorkOutlineIcon />
            </li>
            <li onClick={() => setToggleMenu(false)}>
              <Link
                  href="/candidate/likedJobs"
                  style={{ textDecoration: "none" , color: "white"}}
                >
                  <p>favourite</p>
                </Link>
              <FavoriteBorderIcon />
            </li>
            <li onClick={() => setToggleMenu(false)}>
              <p>
                <Link
                  href="/candidate/appliedJobs"
                  style={{ textDecoration: "none", color: "white" }}
                >
                  applied
                </Link>
              </p>
            </li>
            {!session && (
              <li onClick={() => setToggleMenu(false)}>
                <p>
                  <Link
                    href="/auth/signup"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    signup
                  </Link>
                </p>
              </li>
            )}
          </ul>
        )}
        {accountType === "recruiter" && (
          <ul className={styles.listToggle}>
            <li onClick={() => setToggleMenu(false)}>
              <Link
                href="/recruiter/chats"
                style={{ textDecoration: "none", color: "white" }}
              >
                <p>inbox</p>
              </Link>
              <ChatIcon />
            </li>
            <li onClick={() => setToggleMenu(false)}>
              <p>notifications</p>
              <NotificationsNoneIcon />
            </li>
            <li onClick={() => setToggleMenu(false)}>
              <p>
                <Link
                  href="/recruiter/vaccancy/allVaccancies"
                  style={{ textDecoration: "none", color: "white" }}
                >
                  vaccanciesPosted
                </Link>
              </p>
            </li>
            <li onClick={() => setToggleMenu(false)}>
              <p>
                <Link
                  href="/recruiter/vaccancy"
                  style={{ textDecoration: "none", color: "white" }}
                >
                  post job
                </Link>
              </p>
            </li>
            {!session && (
              <li onClick={() => setToggleMenu(false)}>
                <p>
                  <Link
                    href="/auth/signup"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    signup
                  </Link>
                </p>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
