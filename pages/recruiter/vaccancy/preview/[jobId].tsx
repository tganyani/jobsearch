import {useState, useEffect} from "react"
import { useRouter } from "next/router";
import styles from "@/styles/Job.module.scss";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import useSWR,{ useSWRConfig }  from "swr";
import { baseUrl } from "@/baseUrl";
import { useDispatch } from "react-redux";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import dayjs from "dayjs";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import Button from "@mui/material/Button";

import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime);

import { io } from "socket.io-client";

const socket = io(`${baseUrl}`);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JobPreview(){
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const [refreshJobUpdate, setRefreshJobUpdate] = useState()
  const dispatch = useDispatch();
  const { data, error } = useSWR(
    `${baseUrl}/vaccancy/${router.query.jobId}`,
    fetcher
  );

  useEffect(()=>{
    socket.on("refreshUpdateJob",(data)=>{
      setRefreshJobUpdate(data)
    })
  },[socket])

  useEffect(()=>{
    mutate(`${baseUrl}/vaccancy/${router.query.jobId}`)
  },[refreshJobUpdate])

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
    return(
        <div className={styles.container}>
      <div className={styles.job}>
        <div className={styles.header}>
          <h4>{data?.title}, ${data.salary}</h4>
          <div className={styles.company}>
           {
            !data.recruiter.image && <div
            className={styles.image}
            style={{
              backgroundColor: "grey",
              width: "40px",
              height: "40px",
              borderRadius: "20px",
            }}
          ></div>
           }
            {
            data.recruiter.image && <img style={{width:"60px", height:"60px", borderRadius:"30px"}}  src={`${baseUrl}${data.recruiter.image}`}/>
           }
            <div className={styles.companyName}>
              <h5>{data?.companyName}</h5>
              <p>
                <LocationOnIcon style={{ fontSize: "15px", color: "grey" }} />
                {data.city},{data.country}
              </p>
            </div>
          </div>
        </div>
        <div className={styles.description}>
          <p>{data?.description}</p>
        </div>
        <div className={styles.skills}>
          <h5>key skills</h5>
          <ul className={styles.skill}>
              {
                data.skills?.data.map((item:any)=>(
                  <li className={item.id}>{item.title}</li>
                ))
              }
          </ul>
        </div>
        <div className={styles.companyWebsite}>
          <h5>more about us</h5>
          <div className={styles.contacts}>
            <p>{data.recruiter?.email}</p>
            <p>{data.recruiter?.phone}</p>
          <a href={data?.companyWebsite}>{data?.companyWebsite}</a>
          </div>
        </div>
        <div className={styles.info}>
          <p>posted ,{dayjs(data.dateUpdated).fromNow()}</p>
          <div className={styles.sub}>
            <div className={styles.views}>
              <VisibilityIcon />
              <p>2 viewed</p>
            </div>
            <div className={styles.applicants}>
              <PeopleOutlineIcon />
              <p>10 applied</p>
            </div>
            <p><HomeWorkIcon style={{ fontSize: "15px", color: "grey" }} />{data.condition}</p>
          </div>
        </div>
        <div>
        <Button
                color="success"
                sx={{
                  height: "25px",
                  textTransform: "lowercase",
                  fontWeight: "300",
                  boxShadow: 0,
                  borderRadius: "12px",
                }}
                variant="contained"
                onClick={()=>router.push(`/recruiter/vaccancy/edit/${router.query.jobId}`)}
              >
               edit
              </Button>
        </div>
      </div>
    </div>
    )
}