import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useRouter } from "next/router";
import { baseUrl } from "@/baseUrl";
import styles from "../../../../styles/Applicants.module.scss";
import Button from "@mui/material/Button";
import axios from "axios";
import { Link } from "@mui/material";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { io } from "socket.io-client";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const socket = io(`${baseUrl}`);

export default function Applicants() {
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const { vaccancyId } = router.query;
  const [loading , setLoading] = useState(false)
  const [currentLoading, setCurrentLoading] = useState<number>()
  const [loadingAccept, setLoadingAccept] = useState<boolean>(false)

  const { data, error } = useSWR(`${baseUrl}/vaccancy/${vaccancyId}`, fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div style={{display:"flex",flexDirection:"row",justifyContent:"center",marginTop:"70px"}}><CircularProgress/></div>;
  const handleAccept = async (
    candidateId: string | any,
    chatId: number | any,
    firstName: string | any,
    companyName: string | any,
    fName:string|any,
    lName:string | any
  ) => {
    setCurrentLoading(Number(candidateId))
    setLoadingAccept(true)
    await axios
      .post(`${baseUrl}/vaccancy/accept/${candidateId}`, { id: vaccancyId })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
    await mutate(`${baseUrl}/vaccancy/${vaccancyId}`);
    await socket.emit("sendInvitationMsg", {
      chatId,
      firstName,
      companyName,
      fName,
      lName
    });
    setLoadingAccept(false)
  };
  const handleRefuse = async (candidateId: string | any ,
    chatId: number | any,
    firstName: string | any,
    companyName: string | any,
    fName:string|any,
    lName:string | any) => {
      setCurrentLoading(Number(candidateId))
      setLoading(true)
    await axios
      .post(`${baseUrl}/vaccancy/refuse/${candidateId}`, { id: vaccancyId })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
    await mutate(`${baseUrl}/vaccancy/${vaccancyId}`);
    await socket.emit("sendRefusalMsg", {
      chatId,
      firstName,
      companyName,
      fName,
      lName
    });
    setLoading(false)
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        candidates who have applied for a <span>{data.title}</span> position
      </div>
      <div className={styles.applicants}>
        {data?.candidatesApplied.map((item: any) => (
          <div key={item.id} className={styles.applicant}>
            <div
              style={{
                display: "flex",
                flexFlow: "row nowrap",
                columnGap: "20px",
              }}
            >
              <h5>
                {item.lastName} {item.firstName}
              </h5>
              <Chip
                label="start conversation"
                sx={{ color: "lawngreen" }}
                onClick={() => router.push(`/recruiter/chats/${data?.recruiter.rooms.filter((rm:any)=>rm.candidateId === item.id)[0].id}`)}
              />
            </div>
            <div className={styles.name}>
              <p>{item?.letter[0]?.message}</p>
              <Link href={`/recruiter/vaccancy/${vaccancyId}/${item.id}`}>
                <p>view profile</p>
              </Link>
            </div>
            <div className={styles.footer}>
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
                onClick={() =>
                  handleAccept(
                    item.id,
                    item?.telegram?.chatId,
                    item?.telegram?.firstName,
                    data?.companyName,
                    data?.recruiter?.firstName,
                    data?.recruiter?.lastName
                  )
                }
                disabled={
                  item?.accepted?.jobsAccepted.filter(
                    (it: any) => Number(it.id) === Number(vaccancyId)
                  ).length
                }
              >
                {item?.accepted?.jobsAccepted.filter(
                  (it: any) => Number(it.id) === Number(vaccancyId)
                ).length
                  ? "invited"
                  : "invite"}
              </Button>
              <Button
                color="error"
                sx={{
                  height: "25px",
                  textTransform: "lowercase",
                  fontWeight: "300",
                  boxShadow: 0,
                  borderRadius: "12px",
                }}
                variant="contained"
                onClick={() => handleRefuse(item.id,
                  item?.telegram?.chatId,
                  item?.telegram?.firstName,
                  data?.companyName,
                  data?.recruiter?.firstName,
                  data?.recruiter?.lastName)}
                  disabled={item?.refused?.jobsRefused.filter(
                    (it: any) => Number(it.id) === Number(vaccancyId)
                  ).length>0}
              >
                  not ready
              </Button>
              {(loading&&(Number(item.id)===currentLoading))&&<CircularProgress color="error"/>}
              {(loadingAccept&&(Number(item.id)===currentLoading))&&<CircularProgress color="success"/>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
