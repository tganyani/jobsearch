import { baseUrl } from "@/baseUrl";
import { RootState } from "@/store/store";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import useSWR from "swr";
import Button from "@mui/material/Button";
import styles from "../../styles/AppliedJobs.module.scss";
import Chip from '@mui/material/Chip';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
export default function AppliedJobs() {
  const router = useRouter()
  const id = useSelector((state: RootState) => state.session.id);
  const { data, error } = useSWR(
    `${baseUrl}/vaccancy/connected/${id}`,
    fetcher
  );
console.log(data)
  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <div className={styles.contained}>
      {data?.jobsApplied.map((item: any) => (
        <div key={item.id} className={styles.job}>
          <div className={styles.header}>
            
            <h4>
              <Link href={`/${item.id}`}>{item.title}</Link>
            </h4>
            {data?.refused?.jobsRefused.filter((it:any)=>it.id === item.id)[0]&&<Chip sx={{color:"red"}} label="not ready to invite" />}
            {data?.accepted?.jobsAccepted.filter((it:any)=>it.id === item.id)[0]&&<Chip sx={{color:"lawngreen"}} label="invited, start conversation" onClick={()=>router.push(`/candidate/chats/${item.recruiter.id}`)} />}
            {
              (!data?.refused?.jobsRefused.filter((it:any)=>it.id === item.id)[0]&& !data?.accepted?.jobsAccepted.filter((it:any)=>it.id === item.id)[0])&&<Chip sx={{color:"black"}} label="pending..." />
            }
          </div>
          <div className={styles.card}>{item.description}</div>
          <div>
          <Button
                  sx={{
                    fontWeight: "300",
                    boxShadow: 0,
                    textTransform: "lowercase",
                    padding: "1px",
                  }}
                  onClick={() => router.push(`/${item.id}`)}
                >
                  read more
                </Button>
          </div>
          <div className={styles.footer}>
            <p>23 candidates viewed so far</p>
            <p>12 candidates have applied</p>
          </div>
        </div>
      ))}
    </div>
  );
}
