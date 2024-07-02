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
import Cookies from "js-cookie";
import { Typography } from "@mui/material";

const socket = io(`${baseUrl}`);

export default function NavBar() {
  const [toggleMenu, setToggleMenu] = useState<boolean>(false);
  const router = useRouter();
  const userEmail = useSelector((state: RootState) => state.session.email);
  const session = useSelector((state: RootState) => state.session.access_token);
  const id = useSelector((state: RootState) => state.session.id);
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
  const iconsStyle = {
    fontSize: "14px",
  };

  return (
    <div className={styles.container}>
      <Typography variant="body1" component="div" className={styles.logo}>
        Imisebenzi
      </Typography>
      <div className={styles.menu}>
        <MenuIcon onClick={() => setToggleMenu(!toggleMenu)} />
      </div>
      <div className={styles.navLists}>
        {accountType === "candidate" && (
          <ul className={toggleMenu ? styles.openMenu : styles.list}>
            <li>
              <Link
                href="/candidate/chats"
                style={{ textDecoration: "none", color: "white" }}
                className={styles.link}
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
                  <ChatIcon sx={iconsStyle} className={styles.icon} />
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className={styles.link}
                style={{ textDecoration: "none", color: "white" }}
              >
                <div className={styles.pContainer}>
                  <Typography
                    variant="body2"
                    component="div"
                    className={styles.p}
                  >
                    notifications
                  </Typography>
                </div>
                <div className={styles.iconContainer}>
                  <NotificationsNoneIcon
                    sx={iconsStyle}
                    className={styles.icon}
                  />
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/"
                style={{ textDecoration: "none", color: "white" }}
                className={styles.link}
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
            <li>
              <Link
                href="/candidate/likedJobs"
                className={styles.link}
                style={{ textDecoration: "none", color: "white" }}
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
                  <FavoriteBorderIcon sx={iconsStyle} className={styles.icon} />
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/candidate/appliedJobs"
                className={styles.link}
                style={{ textDecoration: "none", color: "white" }}
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
            {!session && (
              <li>
                <Link
                  href="/auth/signup"
                  style={{ textDecoration: "none", color: "white" }}
                  className={styles.link}
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
            <li>
              <Link
                href="/recruiter/chats"
                style={{ textDecoration: "none", color: "white" }}
                className={styles.link}
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
                  <ChatIcon sx={iconsStyle} className={styles.icon} />
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/recruiter/vaccancy/allVaccancies"
                style={{ textDecoration: "none", color: "white" }}
                className={styles.link}
              >
                <div className={styles.pContainer}>
                  <Typography
                    variant="body2"
                    component="div"
                    className={styles.p}
                  >
                    notifications
                  </Typography>
                </div>
                <div className={styles.iconContainer}>
                  <NotificationsNoneIcon
                    sx={iconsStyle}
                    className={styles.icon}
                  />
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/recruiter/vaccancy/allVaccancies"
                style={{ textDecoration: "none", color: "white" }}
                className={styles.link}
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
            <li>
              <Link
                href="/recruiter/vaccancy"
                style={{ textDecoration: "none", color: "white" }}
                className={styles.link}
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
            {!session && (
              <li>
                <p>
                  <Link
                    href="/auth/signup"
                    style={{ textDecoration: "none", color: "white" }}
                    className={styles.link}
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
        <div className={styles.account}>
          <Typography
            sx={{
              color: "lawngreen",
              position: "absolute",
              right: "0px",
              top: "0px",
            }}
            variant="body2"
            component="div"
          >
            {userEmail}
          </Typography>
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
            {!session && (
              <MenuItem onClick={handleClose}>
                <li
                  onClick={() => {
                    router.push("/");
                  }}
                >
                  login
                </li>
              </MenuItem>
            )}
            {session && (
              <div>
                <MenuItem onClick={handleClose}>
                  <li
                    onClick={() => {
                      socket.emit("offline", { accountType, id });
                      dispatch(removeSession());
                      router.push("/");
                      Cookies.remove("user");
                    }}
                  >
                    logout
                  </li>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  {accountType === "candidate" && (
                    <li>
                      <Link
                        href="/candidate"
                        style={{ textDecoration: "none" }}
                      >
                        profile
                      </Link>
                    </li>
                  )}
                  {accountType === "recruiter" && (
                    <li>
                      <Link
                        href="/recruiter"
                        style={{ textDecoration: "none" }}
                      >
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
                </MenuItem>
              </div>
            )}
          </Menu>
        </div>
      </div>
    </div>
  );
}
