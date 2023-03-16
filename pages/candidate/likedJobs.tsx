import { useSWRConfig } from "swr";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useState } from "react";

import { RootState } from "@/store/store";

import styles from "@/styles/LikedJobs.module.scss";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import Button from "@mui/material/Button";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import useSWR from "swr";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeWorkIcon from "@mui/icons-material/HomeWork";

import { baseUrl } from "@/baseUrl";
import JobApply from "@/components/job.apply.modal";
import { setOpenApply } from "@/store/slice/modalSlice";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import Pagination from "@mui/material/Pagination";
import axios from "axios";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LikedJobs() {
  const { mutate } = useSWRConfig();
  const [jobId, setJobId] = useState<number | any>();
  const [page, setPage] = useState<number>(1);
  const [recruiter, setRecruiter] = useState<
    { id: number; email: string } | any
  >();

  const dispatch = useDispatch();
  const router = useRouter();
  const id = useSelector((state: RootState) => state.session.id);
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  const handleDislike = async (Id:number)=>{
  await axios.patch(`${baseUrl}/vaccancy/dislike/${Id}`,{id})
  await mutate(`${baseUrl}/vaccancy/liked/${id}`)
  }
  const { data, error } = useSWR(`${baseUrl}/vaccancy/liked/${id}`, fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <div className={styles.container}>
      <JobApply jobId={jobId} recruiter={recruiter} />
      <div className={styles.jobs}>
        <div className={styles.header}>liked jobs</div>
        <div className={styles.jobContainer}>
          {data.jobsLiked.map((job: any) => (
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
                        job?.candidatesApplied[0]
                          ?.jobsApplied.filter(
                            (it: any) => Number(it.id) === Number(job.id)
                          ).length
                      }
                    >
                      {job?.candidatesApplied[0]
                        ?.jobsApplied.filter(
                          (it: any) => Number(it.id) === Number(job.id)
                        ).length
                        ? "Applied"
                        : "Apply"}
                    </Button>
                    <FavoriteBorderIcon
                      className={ styles.liked}
                      onClick={()=>handleDislike(job.id)}
                    />
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
  ) 
}
