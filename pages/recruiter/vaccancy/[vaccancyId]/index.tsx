import useSWR,{ useSWRConfig } from "swr";
import { useRouter } from "next/router";
import { baseUrl } from "@/baseUrl";
import styles from "../../../../styles/Applicants.module.scss";
import Button from "@mui/material/Button";
import axios from "axios";
import { Link } from "@mui/material";
import Chip from '@mui/material/Chip';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Applicants() {
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const { vaccancyId } = router.query;
  const { data, error } = useSWR(`${baseUrl}/vaccancy/${vaccancyId}`, fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  const handleAccept = async (candidateId:string|any)=>{
    await axios.post(`${baseUrl}/vaccancy/accept/${candidateId}`,{id:vaccancyId})
    .then(res=>{
      console.log(res.data)
    }).catch(err=>{
      console.error(err)
    })
    await mutate(`${baseUrl}/vaccancy/${vaccancyId}`)
  }
  const handleRefuse = async (candidateId:string|any)=>{
    await axios.post(`${baseUrl}/vaccancy/refuse/${candidateId}`,{id:vaccancyId})
    .then(res=>{
      console.log(res.data)
    }).catch(err=>{
      console.error(err)
    })
    await mutate(`${baseUrl}/vaccancy/${vaccancyId}`)
  }
  console.log(data)
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        candidates who have applied for a <span>{data.title}</span> position
      </div>
      <div className={styles.applicants}>
        {data?.candidatesApplied.map((item: any) => (
          <div key={item.id} className={styles.applicant}>
            <div style={{display:"flex", flexFlow:"row nowrap", columnGap:"20px"}}>
            <h5>{item.lastName} {item.firstName}</h5>
            <Chip label="start conversation" sx={{color:"lawngreen"}}  onClick={()=>router.push(`/recruiter/chats/${item.id}`)}/>
            </div>
            <div className={styles.name}>
              <p>{item?.letter[0].message}</p>
              <Link href={`/recruiter/vaccancy/${vaccancyId}/${item.id}`}><p>view profile</p></Link>
            </div>
            <div className={styles.footer}>
              <Button
                color="success"
                sx={{
                  height: "25px",
                  textTransform: "lowercase",
                  fontWeight: "300",
                  boxShadow: 0,
                  borderRadius:"12px"
                }}
                variant="contained"
                onClick={()=>handleAccept(item.id)}
                disabled={item?.accepted?.jobsAccepted.filter((it:any)=>Number(it.id) === Number( vaccancyId)).length}
              >
                {item?.accepted?.jobsAccepted.filter((it:any)=>Number(it.id) === Number( vaccancyId)).length?"invited":"invite"}
              </Button>
              <Button
                color="error"
                sx={{
                  height: "25px",
                  textTransform: "lowercase",
                  fontWeight: "300",
                  boxShadow: 0,
                  borderRadius:"12px"
                }}
                variant="contained"
                onClick={()=>handleRefuse(item.id)}
              >
                not ready
              </Button>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
