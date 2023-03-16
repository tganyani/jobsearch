import { useSWRConfig } from "swr";
import Link from "next/link";
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
import { setSession } from "@/store/slice/sessionSlice";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import Pagination from "@mui/material/Pagination";
import axios from "axios";
import { io } from "socket.io-client";
import { nanoid } from "nanoid";

const socket = io(`${baseUrl}`);
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { mutate } = useSWRConfig();
  const [jobId, setJobId] = useState<number | any>();
  const [page, setPage] = useState<number>(1);
  const [title, setTitle] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [refreshNewJobs, setRefreshNewJobs] = useState("");
  const [loading, setLoading] = useState<Boolean>(false);
  const [recruiter, setRecruiter] = useState<
    { id: number; email: string } | any
  >();
  const [TabValue, setTabValue] = useState(0);

  const dispatch = useDispatch();
  const router = useRouter();
  const session = useSelector((state:RootState) => state.session.access_token);
  const position = useSelector((state: RootState) => state.session.position);
  const id = useSelector((state: RootState) => state.session.id);
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );

  useEffect(() => {
    socket.on("refreshJobs", (data) => {
      setRefreshNewJobs(data);
    });
  }, [socket]);

  useEffect(() => {
    mutate(`${baseUrl}/vaccancy`);
  }, [refreshNewJobs]);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  const handleDislike = async (Id: number) => {
    await axios.patch(`${baseUrl}/vaccancy/dislike/${Id}`, { id });
    await mutate(`${baseUrl}/vaccancy`);
  };
  const handleLike = async (Id: number) => {
    await axios.patch(`${baseUrl}/vaccancy/like/${Id}`, { id });
    await mutate(`${baseUrl}/vaccancy`);
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
                    position: res.data.position,
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
    setLoading(true);
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
                  })
                );
                setLoading(false);
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

  const { data, error } = useSWR(`${baseUrl}/vaccancy`, fetcher);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (error && session) return <div>Failed to load</div>;
  if (!data && session) return <CircularProgress />;
  return session ? (
    <div className={styles.container}>
      <JobApply jobId={jobId} recruiter={recruiter} />
      <div className={styles.searchBar}>
        <SearchIcon />
        <div className={styles.inputs}>
          <TextField
            id="standard-basic"
            label="job title"
            size="small"
            className={styles.inputText}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            id="standard-basic"
            label="country"
            size="small"
            type="text"
            className={styles.inputText}
            onChange={(e) => setCountry(e.target.value)}
          />
          <TextField
            id="standard-basic"
            label="city"
            size="small"
            className={styles.inputText}
            onChange={(e) => setCity(e.target.value)}
          />
          <TextField
            select
            type="text"
            label="job condition"
            size="small"
            className={styles.inputText}
            onChange={(e) => setCondition(e.target.value)}
          >
            <MenuItem value="office">in office </MenuItem>
            <MenuItem value="remote">remote </MenuItem>
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
          >
            {position}
            <Tab
              sx={{ textTransform: "capitalize", fontWeight: "400" }}
              label="All Jobs"
              onClick={() => setTitle("")}
            />
            <Tab
              sx={{ textTransform: "capitalize", fontWeight: "400" }}
              label="My Jobs"
              onClick={() => setTitle(position)}
            />
          </Tabs>
        </div>
        <div className={styles.jobContainer}>
          {data
            .filter((item: any) =>
              item.title.toLowerCase().includes(title.toLowerCase())
            )
            .filter((item: any) =>
              item.country.toLowerCase().includes(country.toLowerCase())
            )
            .filter((item: any) =>
              item.city.toLowerCase().includes(city.toLowerCase())
            )
            .filter((item: any) =>
              item.condition.toLowerCase().includes(condition.toLowerCase())
            )
            .slice((page - 1) * 6, page * 6)
            .map((job: any) => (
              <div className={styles.jobCard} key={job.id}>
                <div className={styles.cardHeader}>
                  <h4>
                    <Link href={`/${job.id}`}>{job.title}</Link>{" "}
                  </h4>
                  <div className={styles.headerIcons}>
                    <div className={styles.date}>
                      {dayjs(job.dateUpdated).fromNow()}
                    </div>
                    <div className={styles.icons}>
                      <div className={styles.views}>
                        <VisibilityIcon
                          style={{ fontSize: "15px", color: "grey" }}
                        />
                        <p>2</p>
                      </div>
                      <div className={styles.applicants}>
                        <PeopleOutlineIcon
                          style={{ fontSize: "15px", color: "grey" }}
                        />
                        <p>{job?.candidatesApplied.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.descriptrion}>
                  <p className={styles.desc}>{job.description}</p>
                  <ul className={styles.skills}>
                    <p>key skills</p>
                    {job.skills?.data.map((item: any) => (
                      <li key={item.id}>{item.title}</li>
                    ))}
                  </ul>
                </div>
                <Button
                  sx={{
                    fontWeight: "300",
                    boxShadow: 0,
                    textTransform: "lowercase",
                    padding: "1px",
                  }}
                  onClick={() => router.push(`/${job.id}`)}
                >
                  read more
                </Button>
                <div className={styles.footer}>
                  <div className={styles.sub1}>
                    <div className={styles.image}>{job.companyName}</div>
                    <div className={styles.address}>
                      <LocationOnIcon
                        style={{ fontSize: "15px", color: "grey" }}
                      />
                      {job.city},{job.country}
                    </div>
                    <div className={styles.jobcondition}>
                      <HomeWorkIcon
                        style={{ fontSize: "15px", color: "grey" }}
                      />
                      {job.condition}
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
                          dispatch(setOpenApply());
                          setRecruiter(job.recruiter);
                        }}
                        sx={{
                          fontWeight: "300",
                          boxShadow: 0,
                          textTransform: "lowercase",
                        }}
                        disabled={
                          job?.candidatesApplied
                            .filter(
                              (it: any) => Number(it.id) === Number(id)
                            )[0]
                            ?.jobsApplied.filter(
                              (it: any) => Number(it.id) === Number(job.id)
                            ).length
                        }
                      >
                        {job?.candidatesApplied
                          .filter((it: any) => Number(it.id) === Number(id))[0]
                          ?.jobsApplied.filter(
                            (it: any) => Number(it.id) === Number(job.id)
                          ).length
                          ? "Applied"
                          : "Apply"}
                      </Button>
                    )}
                    {accountType === "candidate" &&
                      job.likedCandidates?.filter(
                        (item: any) => item.candidateId === id
                      ).length > 0 && (
                        <FavoriteBorderIcon
                          className={styles.liked}
                          onClick={() => handleDislike(job.id)}
                        />
                      )}
                    {accountType === "candidate" &&
                      !job.likedCandidates?.filter(
                        (item: any) => item.candidateId === id
                      ).length && (
                        <FavoriteBorderIcon
                          className={styles.notLiked}
                          onClick={() => handleLike(job.id)}
                        />
                      )}
                  </div>
                </div>
              </div>
            ))}
        </div>
        <Pagination
          count={Math.floor(data.length / 6) + 1}
          page={page}
          onChange={handleChange}
          color="primary"
        />
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
        }}
      >
        <p>You are not logged in</p>
        <div
          style={{
            display: "flex",
            flexFlow: "column nowrap",
            alignItems: "center",
            justifyContent: "center",
            rowGap: "30px",
          }}
        >
          <Button
            variant="contained"
            onClick={() => {
              dispatch(setAccountType("candidate"));
              router.push("/auth/signin");
            }}
            sx={{
              fontWeight: "300",
              boxShadow: 0,
              padding: "10px",
              height: "30px",
              textTransform: "lowercase",
              backgroundColor: "lawngreen",
              width: "100%",
            }}
          >
            continue as a candidate
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              dispatch(setAccountType("recruiter"));
              router.push("/auth/signin");
            }}
            sx={{
              fontWeight: "300",
              boxShadow: 0,
              padding: "10px",
              height: "30px",
              textTransform: "lowercase",
              backgroundColor: "lawngreen",
              width: "100%",
            }}
          >
            continue as a recruiter
          </Button>
          <Button
            variant="contained"
            sx={{
              fontWeight: "300",
              boxShadow: 0,
              padding: "10px",
              height: "30px",
              textTransform: "lowercase",
              backgroundColor: "lawngreen",
              width: "100%",
              borderRadius: "15px",
            }}
            onClick={handleCandidateGuest}
          >
            login as guest candidate
          </Button>
          <Button
            variant="contained"
            sx={{
              fontWeight: "300",
              boxShadow: 0,
              padding: "10px",
              height: "30px",
              textTransform: "lowercase",
              backgroundColor: "lawngreen",
              width: "100%",
              borderRadius: "15px",
            }}
            onClick={handleRecruiterGuest}
          >
            login as guest recruiter
          </Button>
          {loading && <CircularProgress />}
        </div>
      </div>
    </div>
  );
}
