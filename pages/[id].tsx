import { useSelector } from "react-redux";
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

import { removeSession, setSession } from "@/store/slice/sessionSlice";
import { Typography } from "@mui/material";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Job() {
  const id = useSelector((state: RootState) => state.session.id);
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );
  const user = useSelector((state) => state.session);
  const router = useRouter();
  const dispatch = useDispatch();

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
  if (!data) return <div>Loading...</div>;
  console.log(data);
  return (
    <div className={styles.container}>
      <div className={styles.job}>
        <div className={styles.header}>
          <div className={styles.top}>
            <Typography variant="body1" component="div">
              {data?.title}
            </Typography>
            <Typography variant="body1" component="div">
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
            <Typography
              color="text.secondary"
              variant="body2"
              component="div"
              className={styles.contact}
            >
              {data.recruiter?.email}
            </Typography>{" "}
            <Typography
              color="text.secondary"
              variant="body2"
              component="div"
              className={styles.contact}
            >
              {data.recruiter?.phone}
            </Typography>
            <a
              className={styles.contact}
              style={{ textDecoration: "none" }}
              href={data?.companyWebsite}
            >
              {data?.companyWebsite}
            </a>
          </div>
        </div>
        <div className={styles.info}>
          <p style={{ whiteSpace: "nowrap" }}>
            <Typography
              variant="body2"
              component="div"
              color="text.secondary"
            >
              posted ,{dayjs(data.dateUpdated).fromNow()}
            </Typography>
          </p>
          <div className={styles.sub}>
            <div className={styles.views}>
              <VisibilityIcon style={{ color: "#eeeeee", fontSize: "20px" }} />
              <p style={{ whiteSpace: "nowrap" }}>
                <Typography
                  sx={{color:"white"}}
                  variant="body2"
                  component="div"
                >
                  2 viewed
                </Typography>
              </p>
            </div>
            <div className={styles.applicants}>
              <PeopleOutlineIcon
                style={{ color: "#eeeeee", fontSize: "20px" }}
              />
              <p style={{ whiteSpace: "nowrap" }}>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{color:"white"}}
                >
                  10 applied
                </Typography>
              </p>
            </div>
            <div className={styles.condition}>
              <HomeWorkIcon style={{ color: "#eeeeee", fontSize: "20px" }} />
              <p>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{color:"white"}}
                >
                  {data.condition}
                </Typography>
              </p>
            </div>
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
          {accountType === "candidate" && <FavoriteBorderIcon />}
        </div>
      </div>
      <JobApply jobId={data.id} recruiter={data?.recruiter} />
    </div>
  );
}
