import { useSWRConfig } from "swr";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { setAccountType } from "@/store/slice/accountSlice";
import { RootState } from "@/store/store";

import styles from "@/styles/Home.module.scss";
import TextField from "@mui/material/TextField";
import { MenuItem } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import Button from "@mui/material/Button";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import useSWR from "swr";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { baseUrl } from "@/baseUrl";
import JobApply from "@/components/job.apply.modal";
import { setOpenApply } from "@/store/slice/modalSlice";
import { removeSession, setSession } from "@/store/slice/sessionSlice";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import { createRipples } from "react-ripples";
import Pagination from "@mui/material/Pagination";
import axios from "axios";
import { io } from "socket.io-client";
import { nanoid } from "nanoid";
import { Typography } from "@mui/material";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import Chip from "@mui/material/Chip";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

import { jobFields } from "./recruiter/vaccancy";

const socket = io(`${baseUrl}`);

export const MyRipple = createRipples({
  color: "lawngreen",
  during: 2200,
});

export default function Home() {
  const { mutate } = useSWRConfig();
  const [jobId, setJobId] = useState<number | any>();
  const [jobTitle, setJobTitle] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [title, setTitle] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [field, setField] = useState<string>("all");
  const [refreshNewJobs, setRefreshNewJobs] = useState("");
  const [refreshNewView, setRefreshNewView] = useState("");
  const [loading, setLoading] = useState<Boolean>(false);
  const [loading2, setLoading2] = useState<Boolean>(false);
  const [recruiter, setRecruiter] = useState<
    { id: number; email: string } | any
  >();
  const [TabValue, setTabValue] = useState(0);
  const matches = useMediaQuery("(max-width:600px)");

  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.session);
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );

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
      `${baseUrl}/vaccancy?page=${page}&title=${title}&city=${city}&country=${country}&field=${field}`,
      user.access_token,
      user.refresh_token,
    ]);
  }, [refreshNewJobs]);
  // refresh on new view
  useEffect(() => {
    mutate([
      `${baseUrl}/vaccancy?page=${page}&title=${title}&city=${city}&country=${country}&field=${field}`,
      user.access_token,
      user.refresh_token,
    ]);
  }, [refreshNewView, page, title]);
  useEffect(() => {
    mutate([
      `${baseUrl}/vaccancy?page=${page}&title=${title}&city=${city}&country=${country}&field=${field}`,
      user.access_token,
      user.refresh_token,
    ]);
  }, [title, city, country, field]);

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
      `${baseUrl}/vaccancy?page=${page}&title=${title}&city=${city}&country=${country}&field=${field}`,
      user.access_token,
      user.refresh_token,
    ]);
  };

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
      `${baseUrl}/vaccancy?page=${page}&title=${title}&city=${city}&country=${country}&field=${field}`,
      user.access_token,
      user.refresh_token,
    ]);
  };
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
  const handleCandidateGuest = async () => {
    const email = "employer1@gmail.com";

    setLoading(true);
    const unique = await nanoid(4);
    const candidate = {
      firstName: `guest${unique}`,
      lastName: `guest${unique}`,
      email: `guest${unique}@gmail.com`,
      password: `password${unique}`,
    };
    const roomName =
      email < candidate?.email
        ? "".concat(email, candidate?.email)
        : "".concat(candidate?.email, email);
    await dispatch(setAccountType("candidate"));
    await axios
      .post(`${baseUrl}/candidates`, candidate)
      .then(async (res) => {
        if (res.data.account) {
          await axios
            .post(`${baseUrl}/candidates/login`, candidate)
            .then((res) => {
              console.log(res.data);
              if (res.data.logged) {
                dispatch(
                  setSession({
                    email: res.data.email,
                    access_token: res.data.access_token,
                    id: res.data.id,
                    position: res.data?.position,
                    city: res.data?.city,
                    country: res.data?.country,
                    refresh_token: res.data.refresh_token,
                    firstName: res.data.firstName,
                    lastName: res.data.lastName,
                  })
                );
                setLoading(false);
                socket.emit("online", {
                  id: res.data.id,
                  accountType: "candidate",
                });
                router.push("/");
                socket.emit("createRoom", {
                  candidateId: res.data.id,
                  recruiterId: 1,
                  name: roomName,
                  message: `Hello i am ${candidate.firstName}`,
                  accountType: "candidate",
                });
              }
            });
        }
      })
      .catch((err) => console.log(err));
  };

  const handleRecruiterGuest = async () => {
    const email = "user1@gmail.com";
    setLoading2(true);
    const unique = await nanoid(4);
    const recruiter = {
      firstName: `guest${unique}`,
      lastName: `guest${unique}`,
      email: `guest${unique}@gmail.com`,
      password: `password${unique}`,
    };
    const roomName =
      email < recruiter?.email
        ? "".concat(email, recruiter?.email)
        : "".concat(recruiter?.email, email);
    await dispatch(setAccountType("recruiter"));
    await axios
      .post(`${baseUrl}/recruiters`, recruiter)
      .then(async (res) => {
        if (res.data.account) {
          await axios
            .post(`${baseUrl}/recruiters/login`, recruiter)
            .then((res) => {
              console.log(res.data);
              if (res.data.logged) {
                dispatch(
                  setSession({
                    email: res.data.email,
                    access_token: res.data.access_token,
                    id: res.data.id,
                    position: res.data.position,
                    city: res.data?.city,
                    country: res.data?.country,
                    refresh_token: res.data.refresh_token,
                    firstName: res.data.firstName,
                    lastName: res.data.lastName,
                  })
                );
                setLoading2(false);
                socket.emit("online", {
                  id: res.data.id,
                  accountType: "recruiter",
                });
                router.push("/");
                socket.emit("createRoom", {
                  candidateId: 1,
                  recruiterId: res.data.id,
                  name: roomName,
                  message: `Hello i am  ${recruiter.firstName} `,
                  accountType: "recruiter",
                });
              }
            });
        }
      })
      .catch((err) => console.log(err));
  };

  const { data, error } = useSWR(
    [
      `${baseUrl}/vaccancy?page=${page}&title=${title}&city=${city}&country=${country}&field=${field}`,
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  const toolTipData: { id: number; title: string }[] = [
    { id: 1, title: "Vague Description" },
    { id: 2, title: "Just not interested" },
    { id: 3, title: "Job posted too long ago" },
    { id: 4, title: "Too Many Applicants" },
  ];
  const toolTipStyle = {
    padding: "6px",
    borderRadius: "10px",
    "&:hover": {
      backgroundColor: "grey",
    },
  };
  const inputStyle = {
    // Root class for the input field
    "& .MuiOutlinedInput-root": {
      fontFamily: "Arial",
      // Class for the border around the input field
      "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: "2px",
      },
      "&.Mui-focused": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "lawngreen",
        },
      },
      "&:hover:not(.Mui-focused)": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "lawngreen",
        },
      },
    },
    // Class for the label of the input field
    "& .MuiInputLabel-outlined": {
      "&.Mui-focused": {
        color: "lawngreen",
      },
    },
  };

  if (error && user.access_token) return <div>Failed to load</div>;
  return  user.access_token ? (
    <div className={styles.container}>
      <JobApply
        jobId={jobId}
        jobTitle={jobTitle}
        firstName={user.firstName}
        lastName={user.lastName}
        recruiter={recruiter}
      />
      <div className={styles.searchBar}>
        <SearchIcon sx={{ color: "lawngreen", fontSize: "20px" }} />
        <div className={styles.inputs}>
          <TextField
            id="standard-basic"
            label="job title"
            size="small"
            className={styles.inputText}
            onChange={(e) => setTitle(e.target.value)}
            sx={inputStyle}
            value={title}
          />
          <TextField
            id="standard-basic"
            label="country"
            size="small"
            type="text"
            className={styles.inputText}
            onChange={(e) => setCountry(e.target.value)}
            sx={inputStyle}
            value={country}
          />
          <TextField
            id="standard-basic"
            label="city"
            size="small"
            className={styles.inputText}
            onChange={(e) => setCity(e.target.value)}
            sx={inputStyle}
            value={city}
          />
          <TextField
            select
            type="text"
            label="job sector or field"
            size="small"
            className={styles.inputText}
            onChange={(e) => setField(e.target.value)}
            sx={inputStyle}
            value={field}
          >
            <MenuItem value="all">all</MenuItem>
            {jobFields.map((field: { id: number | any; title: string }) => (
              <MenuItem id={field.id} value={field.title}>
                {field.title}{" "}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </div>
      <div className={styles.jobs}>
        <div className={styles.header}>
          {" "}
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
              label="All Jobs"
              onClick={() => {
                setTitle("");
                setCity("");
                setCountry("");
              }}
            />
            <Tab
              sx={{
                textTransform: "capitalize",
                fontWeight: "400",
                "&.Mui-selected": {
                  color: "lawngreen",
                },
              }}
              label="My Jobs"
              onClick={() => {
                setTitle(user?.position?.trim());
                setCity(user?.city?.trim());
                setCountry(user?.country?.trim());
              }}
            />
          </Tabs>
        </div>
        {!data && user.access_token ? (
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
        ) : (
          <div className={styles.jobContainer}>
            {data.map((job: any) => (
              <div
                className={styles.jobCard}
                key={job.id}
                style={{
                  backgroundColor:
                    job?.viewedCandidates?.filter(
                      (jb: any) => jb.candidateId === user.id
                    ).length > 0
                      ? "white"
                      : "#F8F8FF",
                }}
              >
                <div className={styles.cardHeader}>
                  <Typography
                    variant="body1"
                    component="div"
                    className={styles.jobTitle}
                  >
                    {job.title}
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

                <div
                  style={{
                    display: "flex",
                    flexFlow: "row nowrap",
                    justifyContent: "space-between",
                  }}
                >
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
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    component="div"
                    className={styles.date}
                  >
                    {dayjs(job.dateUpdated).fromNow()}
                  </Typography>
                </div>
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
                    {accountType === "candidate" && (
                      <Button
                        variant="contained"
                        style={{ height: "25px", textTransform: "lowercase" }}
                        onClick={() => {
                          setJobId(job.id);
                          setJobTitle(job.title);
                          dispatch(setOpenApply());
                          setRecruiter(job.recruiter);
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
                          .filter(
                            (it: any) => Number(it.id) === Number(user.id)
                          )[0]
                          ?.jobsApplied.filter(
                            (it: any) => Number(it.id) === Number(job.id)
                          ).length
                          ? "Applied"
                          : "Apply"}
                      </Button>
                    )}
                    {accountType === "candidate" &&
                      job.likedCandidates?.filter(
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
                              sx={{ color: "grey" }}
                              className={styles.liked}
                              onClick={() => handleDislike(job.id)}
                            />
                          </MyRipple>
                        </div>
                      )}
                    {accountType === "candidate" &&
                      !job.likedCandidates?.filter(
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
                              sx={{ color: "grey" }}
                              className={styles.notLiked}
                              onClick={() => handleLike(job.id)}
                            />
                          </MyRipple>
                        </div>
                      )}

                    <div
                      style={{
                        display: "inline-flex",
                        borderRadius: 25,
                        overflow: "hidden",
                      }}
                    >
                      <MyRipple>
                        <Tooltip
                          title={
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                rowGap: "10px",
                              }}
                            >
                              {toolTipData.map(
                                (toolD: { id: number; title: string }) => (
                                  <Typography
                                    sx={toolTipStyle}
                                    component="span"
                                    variant="body2"
                                    key={toolD.id}
                                    id={toolD.title}
                                  >
                                    {toolD.title}
                                  </Typography>
                                )
                              )}
                            </div>
                          }
                          placement="top"
                          arrow
                        >
                          <FlagOutlinedIcon sx={{ color: "grey" }} />
                        </Tooltip>
                      </MyRipple>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Pagination
              count={page + 1} //Math.floor(data.length / 6)
              page={page}
              onChange={handleChange}
              color="primary"
            />
          </div>
        )}
      </div>
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        flexFlow: "row nowrap",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexFlow: "column nowrap",
          alignItems: "center",
          justifyContent: "center",
          rowGap: "30px",
          boxShadow: "0 0 1px grey",
          padding: matches ? "5%" : "30px",
          borderRadius: "20px",
        }}
      >
        <Typography component="div" variant="body2">
          You are not logged in
        </Typography>
        <div
          style={{
            display: "flex",
            flexFlow: "column nowrap",
            alignItems: "center",
            justifyContent: "center",
            rowGap: "30px",
          }}
        >
          <Chip
            label="continue as a candidate"
            deleteIcon={<ArrowRightAltIcon style={{color:"#eeeeee"}}/>}
            onDelete={()=>console.log("")}
            onClick={() => {
              dispatch(setAccountType("candidate"));
              router.push("/auth/signin");
            }}
            sx={{
              backgroundColor: "limegreen",
              color: "white",
              "&:hover": { color: "black" },
              width: "100%",
            }}
          />
          <Chip
            label="continue as a recruiter"
            deleteIcon={<ArrowRightAltIcon style={{color:"#eeeeee"}}/>}
            onDelete={()=>console.log("")}
            onClick={() => {
              dispatch(setAccountType("recruiter"));
              router.push("/auth/signin");
            }}
            sx={{
              backgroundColor: "limegreen",
              color: "white",
              "&:hover": { color: "black" },
              width: "100%",
            }}
          />
          <Chip
            variant="outlined"
            label= {loading?<CircularProgress size="20px" style={{color:"limegreen"}}/>:"login as guest candidate"}
            onClick={handleCandidateGuest}
            sx={{borderColor:"limegreen","&:hover":{color:"grey"},width:"100%"}}
            clickable={!loading&&!loading2}
          />
          <Chip
            variant="outlined"
            label={loading2?<CircularProgress size="20px" style={{color:"limegreen"}}/>:"login as guest recruiter"}
            onClick={handleRecruiterGuest}
            sx={{borderColor:"limegreen","&:hover":{color:"grey"},width:"100%"}}
            clickable={!loading2&&!loading}
          />
        </div>
      </div>
    </div>
  );
}
