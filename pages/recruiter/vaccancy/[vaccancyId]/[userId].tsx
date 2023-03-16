import {useState} from 'react'
import { useRouter } from "next/router";
import { baseUrl } from "@/baseUrl";
import useSWR from "swr";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'

import styles from "../../../../styles/ViewCandidate.module.scss";

dayjs.extend(localizedFormat)
dayjs().format('L LT')

const fetcher = (url: string) => fetch(url).then((res) => res.json());
export default function ViewCandidate() {
  const [enlarge, setEnlarge] = useState<boolean>(false)
  const router = useRouter();
  const { data, error } = useSWR(
    `${baseUrl}/candidates/${router.query.userId}`,
    fetcher
  );

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  console.log(data);
  return (
    <div className={styles.container}>
      <div className={styles.name}>
        <div className={styles.prof}>
        <p style={{fontSize:"18px"}}>
          {data.firstName} {data.lastName}
        </p>
        <p style={{fontSize:"18px", color:"grey"}}>{data.position}</p>
        <p style={{fontSize:"15px", color:"grey"}}><LocationOnIcon style={{fontSize:"15px", color:"grey"}}/>{data.city}, {data.country}</p>
        </div>
        <div className={styles.image}>
        {!data.image&&<AddPhotoAlternateIcon style={{fontSize:"50px"}} />}
        {data.image&&<img
            src={`${baseUrl}${data.image}`}
            alt="profile"
            className={enlarge?styles.enlarge:styles.img}
            onClick={()=>setEnlarge(!enlarge)}
          />}
        </div>
      </div>
      <div className={styles.about}>
        <h4>about</h4>
        <p style={{fontSize:"15px", color:"grey"}}>{data.about}</p>
      </div>
      <div className={styles.education}>
        <h4>education</h4>
        <ul className={styles.edu}>
          {data.education?.map((item: any) => (
            <li key={item.id}>
              {item.schoolName},({dayjs(item.startDate).format('LL')} - {dayjs(item.endDate).format('LL')})
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.prevPos}>
        <h4>previous positions</h4>
        <ul className={styles.prev}>
          {data.previousPosition?.map((item: any) => (
            <li key={item.id}>
              {item.position},{item.companyName},({dayjs(item.startDate).format('LL')} - {dayjs(item.endDate).format('LL')})
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.projects}>
        <h4>projects</h4>
        <ul className={styles.project}>
        {data.projects?.map((item: any) => (
            <li key={item.id}>
              <p>{item.title}</p> <a href={item.link}><OpenInNewIcon /></a>
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
          <p style={{fontSize:"15px", color:"grey"}}>{data.contacts?.email}</p>
          <p style={{fontSize:"15px", color:"grey"}}>{data.contacts?.phone}</p>
        </div>
      </div>
    </div>
  );
}
