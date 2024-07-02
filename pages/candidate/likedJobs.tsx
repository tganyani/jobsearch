import { useSWRConfig } from "swr";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { RootState } from "@/store/store";

import styles from "@/styles/LikedJobs.module.scss";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import Button from "@mui/material/Button";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import useSWR from "swr";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import CircularProgress from "@mui/material/CircularProgress";

import { baseUrl } from "@/baseUrl";
import JobApply from "@/components/job.apply.modal";
import { setOpenApply } from "@/store/slice/modalSlice";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import Pagination from "@mui/material/Pagination";
import axios from "axios";
import { removeSession, setSession } from "@/store/slice/sessionSlice";
import { Typography } from "@mui/material";
import { io } from "socket.io-client";
import { MyRipple } from "..";

const socket = io(`${baseUrl}`);

export default function LikedJobs() {
  const { mutate } = useSWRConfig();
  const [jobId, setJobId] = useState<number | any>();
  const [page, setPage] = useState<number>(1);
  const [refreshNewJobs, setRefreshNewJobs] = useState("");
  const [refreshNewView, setRefreshNewView] = useState("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [recruiter, setRecruiter] = useState<
    { id: number; email: string } | any
  >();
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.session);

  useEffect(() => {
    socket.on("refreshJobs", (data) => {
      setRefreshNewJobs(data);
    });
    socket.on("refreshNewView", (data) => {
      setRefreshNewView(data);
    });
  }, [socket]);

  useEffect(() => {
    mutate([
      `${baseUrl}/vaccancy/liked/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  }, [refreshNewJobs]);
  // refresh on new view
  useEffect(() => {
    mutate([
      `${baseUrl}/vaccancy/liked/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  }, [refreshNewView]);

  const handleClickReadMore = async (jobId: number) => {
    await router.push(`/${jobId}`);
    await axios
      .patch(
        `${baseUrl}/vaccancy/view/${user.id}`,
        { id: jobId },
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
    await socket.emit("newView", { candidateId: user.id });
  };

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
      `${baseUrl}/vaccancy/liked/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  };

  const { data, error } = useSWR(
    [
      `${baseUrl}/vaccancy/liked/${user.id}`,
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
  return (
    <div className={styles.container}>
      <JobApply
        jobId={jobId}
        jobTitle={jobTitle}
        firstName={user.firstName}
        lastName={user.lastName}
        recruiter={recruiter}
      />
      <div className={styles.jobs}>
        <Typography variant="h6" component="h6" className={styles.header}>
          liked jobs
        </Typography>
        <div className={styles.jobContainer}>
          {data.jobsLiked.map((job: any) => (
            <div className={styles.jobCard} key={job.id}>
              <div className={styles.cardHeader}>
                <Typography
                  variant="body1"
                  component="div"
                  className={styles.jobTitle}
                >
                  {job.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="div"
                  className={styles.date}
                >
                  {dayjs(job.dateUpdated).fromNow()}
                </Typography>
                <div className={styles.headerIcons}>
                  <div className={styles.icons}>
                    <div className={styles.views}>
                      <VisibilityIcon
                        style={{ fontSize: "15px", color: "lawngreen" }}
                      />
                      <Typography
                        color="text.secondary"
                        variant="body2"
                        component="div"
                        sx={{ fontSize: "12px" }}
                      >
                        {job?.viewedCandidates.length}
                      </Typography>
                    </div>
                    <div className={styles.applicants}>
                      <PeopleOutlineIcon
                        style={{ fontSize: "15px", color: "lawngreen" }}
                      />
                      <Typography
                        color="text.secondary"
                        variant="body2"
                        component="div"
                        sx={{ fontSize: "12px" }}
                      >
                        {job?.candidatesApplied.length}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.descriptrion}>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="div"
                  className={styles.desc}
                >
                  {job.description}
                </Typography>
                <ul className={styles.skills}>
                  <Typography
                    color="text.primary"
                    variant="body2"
                    component="div"
                    className={styles.skillsH}
                  >
                    key skills
                  </Typography>
                  {job.skills?.data.map((item: any) => (
                    <li key={item.id}>
                      <Typography
                        color="text.secondary"
                        variant="body2"
                        component="div"
                        className={styles.skillsV}
                      >
                        {item.title}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                sx={{
                  fontWeight: "300",
                  boxShadow: 0,
                  textTransform: "lowercase",
                  padding: "1px",
                  color: "lawngreen",
                }}
                onClick={() => handleClickReadMore(Number(job.id))}
              >
                read more ...
              </Button>
              <div className={styles.footer}>
                <div className={styles.sub1}>
                  <div className={styles.image}>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      component="div"
                      sx={{ fontSize: "12px" }}
                    >
                      {job.companyName}
                    </Typography>
                  </div>
                  <div className={styles.address}>
                    <LocationOnIcon
                      style={{ fontSize: "12px", color: "lawngreen" }}
                    />

                    <Typography
                      color="text.secondary"
                      variant="body2"
                      component="div"
                      sx={{ fontSize: "12px" }}
                    >
                      {job.city},{job.country}
                    </Typography>
                  </div>
                  <div className={styles.jobcondition}>
                    <HomeWorkIcon
                      style={{ fontSize: "12px", color: "lawngreen" }}
                    />

                    <Typography
                      color="text.secondary"
                      variant="body2"
                      component="div"
                      sx={{ fontSize: "12px" }}
                    >
                      {job.condition}
                    </Typography>
                  </div>
                </div>
                <div
                  className={styles.sub3}
                  style={{
                    display: "flex",
                    flexFlow: "row nowrap",
                    justifyContent: "space-around",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    style={{ height: "25px", textTransform: "lowercase" }}
                    onClick={() => {
                      setJobId(job.id);
                      dispatch(setOpenApply());
                      setRecruiter(job.recruiter);
                      setJobTitle(job.title);
                    }}
                    sx={{
                      fontWeight: "300",
                      boxShadow: 0,
                      textTransform: "lowercase",
                      backgroundColor: "lawngreen",
                    }}
                    disabled={
                      job?.candidatesApplied
                        .filter(
                          (it: any) => Number(it.id) === Number(user.id)
                        )[0]
                        ?.jobsApplied.filter(
                          (it: any) => Number(it.id) === Number(job.id)
                        ).length
                    }
                  >
                    {job?.candidatesApplied
                      .filter((it: any) => Number(it.id) === Number(user.id))[0]
                      ?.jobsApplied.filter(
                        (it: any) => Number(it.id) === Number(job.id)
                      ).length
                      ? "Applied"
                      : "Apply"}
                  </Button>

                  <MyRipple>
                    <FavoriteBorderIcon
                      className={styles.liked}
                      onClick={() => handleDislike(job.id)}
                    />
                  </MyRipple>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Pagination
        count={data.length / 8}
        page={page}
        onChange={handleChange}
        color="primary"
      />
    </div>
  );
}
