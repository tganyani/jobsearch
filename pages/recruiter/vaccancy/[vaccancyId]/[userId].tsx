import { useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { baseUrl } from "@/baseUrl";
import useSWR, { useSWRConfig } from "swr";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import axios from "axios";
import { io } from "socket.io-client";

import styles from "../../../../styles/ViewCandidate.module.scss";

dayjs.extend(localizedFormat);
dayjs().format("L LT");

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const socket = io(`${baseUrl}`);

export default function ViewCandidate() {
  const { mutate } = useSWRConfig();
  const [enlarge, setEnlarge] = useState<boolean>(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const recruiterId = useSelector((state: RootState) => state.session.id);
  const candidateId = router.query.userId;
  const vaccancyId = router.query.vaccancyId;
  const { data, error } = useSWR(
    `${baseUrl}/candidates/${candidateId}`,
    fetcher
  );

  const handleProposeCandidate = async () => {
    setLoading(true);
    await axios
      .post(`${baseUrl}/vaccancy/propose/${vaccancyId}`, {
        recruiterId,
        candidateId,
      })
      .then(async (res) => {
        setLoading(false);
        await socket.emit("sendCandidateProposal", {
          chatId: data?.telegram?.chatId,
          firstName: data?.telegram?.firstName,
        });
        await mutate(`${baseUrl}/candidates/${candidateId}`);
      });
  };

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  console.log(data);
  return (
    <div className={styles.container}>
      <div className={styles.name}>
        <div className={styles.prof}>
          <p style={{ fontSize: "18px" }}>
            {data.firstName} {data.lastName}
          </p>
          <p style={{ fontSize: "18px", color: "grey" }}>{data.position}</p>
          <p style={{ fontSize: "15px", color: "grey" }}>
            <LocationOnIcon style={{ fontSize: "15px", color: "grey" }} />
            {data.city}, {data.country}
          </p>
          <Button
            sx={{
              height: "25px",
              textTransform: "lowercase",
              fontWeight: "300",
              boxShadow: 0,
              borderRadius: "12px",
              backgroundColor: "limegreen",
              whiteSpace: "nowrap",
              maxWidth: "250px",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
            variant="contained"
            onClick={handleProposeCandidate}
            disabled={
              data?.proposed?.proposedJobs?.filter(
                (job: any) => Number(job.id) === Number(vaccancyId)
              ).length
            }
          >
            {data?.proposed?.proposedJobs?.filter(
              (job: any) => Number(job.id) === Number(vaccancyId)
            ).length
              ? "already proposed "
              : "propose candidate"}
          </Button>
          {loading && <CircularProgress />}
        </div>
        <div className={styles.image}>
          {!data.image && (
            <AddPhotoAlternateIcon style={{ fontSize: "50px" }} />
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
        <h4>about</h4>
        <p style={{ fontSize: "15px", color: "grey" }}>{data.about}</p>
      </div>
      <div className={styles.education}>
        <h4>education</h4>
        <ul className={styles.edu}>
          {data.education?.map((item: any) => (
            <li key={item.id}>
              {item.schoolName},({dayjs(item.startDate).format("LL")} -{" "}
              {dayjs(item.endDate).format("LL")})
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.prevPos}>
        <h4>previous positions</h4>
        <ul className={styles.prev}>
          {data.previousPosition?.map((item: any) => (
            <li key={item.id}>
              {item.position},{item.companyName},(
              {dayjs(item.startDate).format("LL")} -{" "}
              {dayjs(item.endDate).format("LL")})
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.projects}>
        <h4>projects</h4>
        <ul className={styles.project}>
          {data.projects?.map((item: any) => (
            <li key={item.id}>
              <p>{item.title}</p>{" "}
              <a href={item.link}>
                <OpenInNewIcon />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.skills}>
        <h4>skills</h4>
        <ul className={styles.skill}>
          {data.skills?.map((item: any) => (
            <li key={item.id}>
              {item.title}- {item.experience} years of experience
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.contacts}>
        <h4>contacts</h4>
        <div className={styles.sub}>
          <p style={{ fontSize: "15px", color: "grey" }}>
            {data.contacts?.email}
          </p>
          <p style={{ fontSize: "15px", color: "grey" }}>
            {data.contacts?.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
