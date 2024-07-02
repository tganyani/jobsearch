import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RootState } from "@/store/store";
import { baseUrl } from "@/baseUrl";
import useSWR, { useSWRConfig } from "swr";
import ImageIcon from "@mui/icons-material/Image";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import axios from "axios";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import styles from "../../../../styles/ViewCandidate.module.scss";
import { Typography } from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import EmailIcon from "@mui/icons-material/Email";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import Carousel from "react-material-ui-carousel";

dayjs.extend(localizedFormat);
dayjs().format("L LT");

const socket = io(`${baseUrl}`);

function groupIntoChunks(array: any, chunkSize: any) {
  const output: any = [];
  let currentChunk: any = [];

  array.forEach((item: any, index: any) => {
    currentChunk.push(item);

    if ((index + 1) % chunkSize === 0 || index === array.length - 1) {
      output.push(currentChunk);
      currentChunk = [];
    }
  });

  return output;
}

export default function ViewCandidate() {
  const { mutate } = useSWRConfig();
  const [enlarge, setEnlarge] = useState<boolean>(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [jobTopropose, setJobTopropose] = useState<any>();
  const recruiterId = useSelector((state: RootState) => state.session.id);
  const user = useSelector((state: RootState) => state.session);
  const dispatch = useDispatch();
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );
  const candidateId = router.query.userId;
  const vaccancyId = router.query.vaccancyId;

  // Determine if it's a mobile or tablet device
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  // Determine the chunk size based on device
  const chunkSize = isTablet ? (isMobile ? 1 : 2) : 3;
  useEffect(() => {
    const fetchJob = async () => {
      await axios
        .get(`${baseUrl}/vaccancy/${vaccancyId}`, {
          headers: { Authorization: "Bearer " + user.access_token },
        })
        .then((res) => setJobTopropose(res.data))
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
    };
    fetchJob();
  }, []);

  const { data, error } = useSWR(
    [
      `${baseUrl}/candidates/${candidateId}`,
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
  const roomName =
    data?.email < user?.email
      ? "".concat(data?.email, user?.email)
      : "".concat(user?.email, data?.email);

  const handleProposeCandidate = async () => {
    setLoading(true);

    await axios
      .post(
        `${baseUrl}/vaccancy/propose/${vaccancyId}`,
        {
          recruiterId,
          candidateId,
        },
        {
          headers: { Authorization: "Bearer " + user.access_token },
        }
      )
      .then(async (res) => {
        setLoading(false);
        await socket.emit("sendCandidateProposal", {
          chatId: data?.telegram?.chatId,
          firstName: data?.telegram?.firstName,
          vaccancyId,
        });
        await socket.emit("createRoom", {
          candidateId,
          recruiterId: user.id,
          name: roomName,
          message: `Hello ${data?.firstName} you have received a job proposal for this position https://jobsearch-lemon.vercel.app/${vaccancyId}`,
          accountType,
          propose: true,
          vaccancyId,
          jobTitle: jobTopropose?.title,
          companyName: jobTopropose?.companyName,
        });
        await mutate([
          `${baseUrl}/candidates/${candidateId}`,
          user.access_token,
          user.refresh_token,
        ]);
      })
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
  };

  if (error) return <div>Failed to load</div>;
  if (!data)
    return (
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
    );
  console.log(data);
  return (
    <div className={styles.container}>
      <div className={styles.name}>
        <div className={styles.prof}>
          <Typography variant="h6" component="div">
            {data.firstName} {data.lastName}
          </Typography>
          <Typography variant="body1" component="div">
            {data.position}
          </Typography>
          <Typography color="GrayText" variant="body2" component="div">
            <LocationOnIcon style={{ fontSize: "15px", color: "lawngreen" }} />
            {data.city}, {data.country}
          </Typography>
          <Button
            sx={{
              height: "25px",
              textTransform: "lowercase",
              fontWeight: "300",
              boxShadow: 0,
              borderRadius: "12px",
              backgroundColor: "limegreen",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              width: "150px",
            }}
            variant="contained"
            onClick={handleProposeCandidate}
            disabled={
              data?.proposed?.proposedJobs?.filter(
                (job: any) => Number(job.id) === Number(vaccancyId)
              ).length
            }
          >
            {loading ? (
              <CircularProgress sx={{ color: "white" }} size="20px" />
            ) : data?.proposed?.proposedJobs?.filter(
                (job: any) => Number(job.id) === Number(vaccancyId)
              ).length ? (
              "already proposed "
            ) : (
              "propose candidate"
            )}
          </Button>
        </div>
        <div className={styles.image}>
          {!data.image && (
            <div
              style={{
                backgroundColor: "lawngreen",
                width: "40px",
                height: "40px",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ImageIcon style={{ fontSize: "25px", color: "white" }} />
            </div>
          )}
          {data.image && (
            <img
              src={`${baseUrl}${data.image}`}
              alt="profile"
              className={enlarge ? styles.enlarge : styles.img}
              onClick={() => setEnlarge(!enlarge)}
            />
          )}
        </div>
      </div>
      <div className={styles.about}>
        <Typography variant="h6" component="div">
          about
        </Typography>
        <Typography color="GrayText" variant="body2" component="div">
          {data.about}
        </Typography>
      </div>
      <div className={styles.education}>
        <Typography variant="h6" component="div">
          education
        </Typography>
        <ul className={styles.edu}>
          {data.education?.map((item: any) => (
            <li key={item.id}>
              <Typography color="GrayText" variant="body2" component="div">
                {item.schoolName},({dayjs(item.startDate).format("LL")} -{" "}
                {dayjs(item.endDate).format("LL")})
              </Typography>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.prevPos}>
        <Typography variant="h6" component="div">
          previous positions
        </Typography>
        <ul className={styles.prev}>
          {data.previousPosition?.map((item: any) => (
            <li key={item.id}>
              <Typography variant="body1" component="div">
                company name
              </Typography>
              <Typography
                sx={{ marginLeft: "10px" }}
                color="GrayText"
                variant="body2"
                component="div"
              >
                {item.companyName}
              </Typography>
              <Typography variant="body1" component="div">
                position
              </Typography>
              <Typography
                sx={{ marginLeft: "10px" }}
                color="GrayText"
                variant="body2"
                component="div"
              >
                {item.position}
              </Typography>
              <Typography variant="body1" component="div">
                duration
              </Typography>
              <Typography
                sx={{ marginLeft: "10px" }}
                color="GrayText"
                variant="body2"
                component="div"
              >
                {dayjs(item.startDate).format("LL")} /{" "}
                {dayjs(item.endDate).format("LL")})
              </Typography>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.projects}>
        <Typography variant="h6" component="div">
          projects
        </Typography>
        <div className={styles.sub}>
          {data?.projects.map((item: any) => (
            <div key={item.id} className={styles.inner}>
              <div className={styles.title}>
                <Typography variant="body1" component="div">
                  {item.title}
                </Typography>
              </div>
              <div className={styles.description}>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="div"
                >
                  {item.description}
                </Typography>
              </div>

              <Carousel>
                {groupIntoChunks(item?.images, chunkSize).map(
                  (imgGroup: any, groupIndex: any) => (
                    <div
                      key={groupIndex}
                      style={{
                        display: "flex",
                        flexFlow: "row nowrap",
                        justifyContent: "space-around",
                      }}
                    >
                      {imgGroup?.map((image: any) => (
                        <div key={image.id}>
                          <img
                            style={{ width: "200px", height: "200px" }}
                            src={`${baseUrl}${image.url}`}
                            alt="project-image"
                          />
                        </div>
                      ))}
                    </div>
                  )
                )}
              </Carousel>
              <div className={styles.link}>
                <a href={item.link}>
                  <OpenInNewIcon
                    sx={{ color: "lawngreen", fontSize: "20px" }}
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.skills}>
        <Typography variant="h6" component="div">
          skills
        </Typography>
        <ul className={styles.skill}>
          {data.skills?.map((item: any) => (
            <li key={item.id}>
              <Typography color="GrayText" variant="body2" component="div">
                {item.title}- {item.experience} years of experience
              </Typography>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.contacts}>
        <Typography variant="h6" component="div">
          contacts
        </Typography>
        <div className={styles.sub}>
          {data?.contacts?.phone && (
            <Chip
              variant="outlined"
              size="small"
              avatar={
                <Avatar sx={{ backgroundColor: "#eeeeee" }}>
                  <CallIcon sx={{ color: "#00FF00", fontSize: "15px" }} />
                </Avatar>
              }
              label={data?.contacts?.phone}
            />
          )}

          <Chip
            size="small"
            variant="outlined"
            avatar={
              <Avatar sx={{ backgroundColor: "#eeeeee" }}>
                <EmailIcon sx={{ color: "#FA5252", fontSize: "15px" }} />
              </Avatar>
            }
            label={data?.email}
          />
        </div>
      </div>
    </div>
  );
}
