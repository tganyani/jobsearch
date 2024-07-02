import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import styles from "@/styles/Job.module.scss";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import useSWR, { useSWRConfig } from "swr";
import { baseUrl } from "@/baseUrl";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import dayjs from "dayjs";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Avatar } from "@mui/material";
import Chip from "@mui/material/Chip";
import { RootState } from "@/store/store";
import axios from "axios";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import { io } from "socket.io-client";

const socket = io(`${baseUrl}`);

// const fetcher = (url: string) => fetch(url).then((res) => res.json());
function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export default function JobPreview() {
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.session);
  const [refreshJobUpdate, setRefreshJobUpdate] = useState();
  const dispatch = useDispatch();

  const { data, error } = useSWR(
    [
      `${baseUrl}/vaccancy/${router.query.jobId}`,
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
              .post(`${baseUrl}/recruiters/refresh`, { refresh_token })
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
    socket.on("refreshUpdateJob", (data) => {
      setRefreshJobUpdate(data);
    });
  }, [socket]);

  useEffect(() => {
    mutate([
      `${baseUrl}/vaccancy/${router.query.jobId}`,
      user.access_token,
      user.refresh_token,
    ]);
  }, [refreshJobUpdate]);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <div className={styles.container}>
      <div className={styles.job}>
        <div className={styles.header}>
          <div className={styles.top}>
            <Typography variant="body1" component="div">
              {data?.title}
            </Typography>
            <Typography variant="body2" color="GrayText" component="div">
              posted ,{dayjs(data.dateUpdated).fromNow()}
            </Typography>
            <Typography variant="body1" component="div">
              <span style={{ color: "lawngreen" }}>$</span>
              {data.salary}
            </Typography>
          </div>
          <div className={styles.company}>
            {data.recruiter.image ? (
              <img
                style={{ width: "60px", height: "60px", borderRadius: "30px" }}
                src={`${baseUrl}${data.recruiter.image}`}
              />
            ) : (
              <Avatar sx={{ bgcolor: stringToColor(data.recruiter.firstName) }}>
                {data.recruiter.firstName.toUpperCase()[0]}
              </Avatar>
            )}
            <div className={styles.companyName}>
              <Typography variant="body2" component="div">
                {data?.companyName}
              </Typography>
              <div className={styles.address}>
                <LocationOnIcon
                  style={{ fontSize: "15px", color: "lawngreen" }}
                />
                <Typography variant="body2" component="div" color="GrayText">
                  {data.city},{data.country}
                </Typography>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.description}>
          <Typography variant="body1" component="div">
            job description
          </Typography>
          <Typography variant="body2" component="div" color="GrayText">
            {data?.description}
          </Typography>
        </div>
        <div className={styles.skills}>
          <Typography variant="body1" component="div">
            key skills
          </Typography>
          <ul className={styles.skill}>
            {data.skills?.data.map((item: any) => (
              <li className={item.id}>
                {" "}
                <Typography variant="body2" component="div" color="GrayText">
                  {item.title}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.companyWebsite}>
          <Typography variant="body1" component="div">
            more about us
          </Typography>
          <div className={styles.contacts}>
            <Typography variant="body2" color="GrayText" component="div">
              {data.recruiter?.email}
            </Typography>
            <Typography variant="body2" color="GrayText" component="div">
              {data.recruiter?.phone}
            </Typography>
            <Typography variant="body2" color="GrayText" component="div">
              <a href={data?.companyWebsite}>{data?.companyWebsite}</a>
            </Typography>
          </div>
        </div>
        <div className={styles.info}>
          <div className={styles.sub}>
            <Chip
              className={styles.icons}
              avatar={
                <Avatar sx={{ backgroundColor: "lawngreen" }}>
                  <VisibilityIcon sx={{ color: "white" }} />
                </Avatar>
              }
              label="2 viewed"
              variant="outlined"
              sx={{ width: "130px" }}
            />
            <Chip
              className={styles.icons}
              avatar={
                <Avatar sx={{ backgroundColor: "lawngreen" }}>
                  <PeopleOutlineIcon sx={{ color: "white" }} />
                </Avatar>
              }
              label="10 applied"
              variant="outlined"
              sx={{ width: "130px" }}
            />
            <Chip
              className={styles.icons}
              avatar={
                <Avatar sx={{ backgroundColor: "lawngreen" }}>
                  <HomeWorkIcon sx={{ color: "white" }} />
                </Avatar>
              }
              label={data.condition}
              variant="outlined"
              sx={{ width: "130px" }}
            />
          </div>
        </div>
        <div>
          <Chip
            label="edit"
            variant="outlined"
            clickable
            sx={{ width: "130px",backgroundColor:"lawngreen",color:"white","&:hover":{
              color:"GrayText"
            } }}
            onClick={() =>
              router.push(`/recruiter/vaccancy/edit/${router.query.jobId}`)
            }
          />
        </div>
      </div>
    </div>
  );
}
