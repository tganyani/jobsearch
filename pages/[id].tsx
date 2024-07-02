import { useSelector } from "react-redux";
import { useSWRConfig } from "swr";
import { useRouter } from "next/router";
import styles from "@/styles/Job.module.scss";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import Button from "@mui/material/Button";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import useSWR from "swr";
import { baseUrl } from "@/baseUrl";
import { useDispatch } from "react-redux";
import JobApply from "@/components/job.apply.modal";
import { setOpenApply } from "@/store/slice/modalSlice";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import dayjs from "dayjs";
import { RootState } from "@/store/store";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

import { removeSession, setSession } from "@/store/slice/sessionSlice";
import { Typography } from "@mui/material";
import { Avatar } from "@mui/material";
import Chip from "@mui/material/Chip";
import { MyRipple } from ".";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
// const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Job() {
  const { mutate } = useSWRConfig();
  const id = useSelector((state: RootState) => state.session.id);
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );
  const user = useSelector((state: RootState) => state.session);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLike = async (Id: number) => {
    await axios
      .patch(
        `${baseUrl}/vaccancy/like/${Id}`,
        { id: user.id },
        {
          headers: { Authorization: "Bearer " + user.access_token },
        }
      )
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
      `${baseUrl}/vaccancy/${router.query.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  };
  const handleDislike = async (Id: number) => {
    await axios
      .patch(
        `${baseUrl}/vaccancy/dislike/${Id}`,
        { id: user.id },
        {
          headers: { Authorization: "Bearer " + user.access_token },
        }
      )
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
      `${baseUrl}/vaccancy/${router.query.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  };

  const { data, error } = useSWR(
    [
      `${baseUrl}/vaccancy/${router.query.id}`,
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
                console.log(res.data);
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

  if (error) return <div>Failed to load</div>;
  if (!data) return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        marginTop: "70px",
      }}
    >
      <CircularProgress sx={{ color: "lawngreen" }} size="20px" />
    </div>
  )
  console.log(data);
  return (
    <div className={styles.container}>
      <div className={styles.job}>
        <div className={styles.header}>
          <div className={styles.top}>
            <Typography variant="body1" component="div">
              {data?.title}
            </Typography>
            <Typography color="GrayText" variant="body1" component="div">
              <span style={{ color: "lawngreen" }}>$</span>
              {data.salary}
            </Typography>
          </div>
          <div className={styles.company}>
            {!data.recruiter.image && (
              <div
                className={styles.image}
                style={{
                  backgroundColor: "grey",
                  width: "40px",
                  height: "40px",
                  borderRadius: "20px",
                }}
              ></div>
            )}
            {data.recruiter.image && (
              <img
                style={{ width: "60px", height: "60px", borderRadius: "30px" }}
                src={`${baseUrl}${data.recruiter.image}`}
              />
            )}
            <div className={styles.companyName}>
              <Typography variant="body2" component="div">
                {data?.companyName}
              </Typography>
              <p
                style={{
                  display: "flex",
                  flexFlow: "row nowrap",
                  alignItems: "center",
                }}
              >
                <LocationOnIcon
                  style={{ fontSize: "15px", color: "lawngreen" }}
                />
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="div"
                >
                  {data.city},{data.country}
                </Typography>
              </p>
            </div>
          </div>
        </div>
        <div className={styles.description}>
          <Typography className={styles.pos} variant="body1" component="div">
            job description
          </Typography>
          <Typography color="text.secondary" variant="body2" component="div">
            {data?.description}
          </Typography>
        </div>
        <div className={styles.skills}>
          <Typography className={styles.pos} variant="body1" component="div">
            key skills
          </Typography>
          <ul className={styles.skill}>
            {data.skills?.data.map((item: any) => (
              <li className={item.id}>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="div"
                >
                  {item.title}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.companyWebsite}>
          <Typography className={styles.pos} variant="body1" component="div">
            more about us
          </Typography>
          <div className={styles.contacts}>
            {data.recruiter?.email && (
              <Typography
                color="text.secondary"
                variant="body2"
                component="div"
                className={styles.contact}
              >
                {data.recruiter?.email}
              </Typography>
            )}

            {data.recruiter?.phone && (
              <Typography
                color="text.secondary"
                variant="body2"
                component="div"
                className={styles.contact}
              >
                {data.recruiter?.phone}
              </Typography>
            )}
            {data?.companyWebsite && (
              <a
                className={styles.contact}
                style={{ textDecoration: "none" }}
                href={data?.companyWebsite}
              >
                {data?.companyWebsite}
              </a>
            )}
          </div>
        </div>
        <div className={styles.info}>
          <p style={{ whiteSpace: "nowrap" }}>
            <Typography variant="body2" component="div" color="text.secondary">
              posted ,{dayjs(data.dateUpdated).fromNow()}
            </Typography>
          </p>
          <div className={styles.sub}>
            <Chip
              className={styles.icons}
              size="small"
              avatar={
                <Avatar sx={{ backgroundColor: "#eeeeee" }}>
                  <VisibilityIcon sx={{ color: "white", fontSize: "20px" }} />
                </Avatar>
              }
              label={`${data?.viewedCandidates.length} viewed`}
              // variant="outlined"
              sx={{ width: "130px" }}
            />
            <Chip
              className={styles.icons}
              size="small"
              avatar={
                <Avatar sx={{ backgroundColor: "#eeeeee" }}>
                  <PeopleOutlineIcon
                    sx={{ color: "white", fontSize: "20px" }}
                  />
                </Avatar>
              }
              label={`${data?.candidatesApplied.length} applied`}
              // variant="outlined"
              sx={{ width: "130px" }}
            />
            <Chip
              className={styles.icons}
              size="small"
              avatar={
                <Avatar sx={{ backgroundColor: "#eeeeee" }}>
                  <HomeWorkIcon sx={{ color: "white", fontSize: "20px" }} />
                </Avatar>
              }
              label={data.condition}
              // variant="outlined"
              sx={{ width: "130px" }}
            />
          </div>
        </div>
        <div className={styles.footer}>
          {accountType === "candidate" && (
            <Button
              variant="contained"
              style={{ height: "25px", textTransform: "lowercase" }}
              onClick={() => dispatch(setOpenApply())}
              sx={{
                fontWeight: "300",
                boxShadow: 0,
                textTransform: "lowercase",
              }}
              disabled={
                data?.candidatesApplied
                  .filter((it: any) => Number(it.id) === Number(id))[0]
                  ?.jobsApplied?.filter(
                    (it: any) => Number(it.id) === Number(router.query.id)
                  ).length
              }
            >
              {data?.candidatesApplied
                .filter((it: any) => Number(it.id) === Number(id))[0]
                ?.jobsApplied.filter(
                  (it: any) => Number(it.id) === Number(router.query.id)
                ).length
                ? "Applied"
                : "Apply"}
            </Button>
          )}
          {accountType === "candidate" &&
            data?.likedCandidates?.filter(
              (item: any) => item.candidateId === user.id
            ).length > 0 && (
              <div
                style={{
                  display: "inline-flex",
                  borderRadius: 25,
                  overflow: "hidden",
                }}
              >
                <MyRipple>
                  <FavoriteBorderIcon
                    className={styles.liked}
                    onClick={() => handleDislike(Number(data.id))}
                  />
                </MyRipple>
              </div>
            )}
          {accountType === "candidate" &&
            !data?.likedCandidates?.filter(
              (item: any) => item.candidateId === user.id
            ).length && (
              <div
                style={{
                  display: "inline-flex",
                  borderRadius: 25,
                  overflow: "hidden",
                }}
              >
                <MyRipple>
                  <FavoriteBorderIcon
                    className={styles.notLiked}
                    sx={{ color: "grey" }}
                    onClick={() => handleLike(Number(data.id))}
                  />
                </MyRipple>
              </div>
            )}
        </div>
      </div>
      <JobApply
        jobId={data.id}
        jobTitle={data?.title}
        firstName={user.firstName}
        lastName={user.lastName}
        recruiter={data?.recruiter}
      />
    </div>
  );
}
