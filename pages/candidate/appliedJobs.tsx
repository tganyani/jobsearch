import { baseUrl } from "@/baseUrl";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import useSWR from "swr";
import Button from "@mui/material/Button";
import styles from "../../styles/AppliedJobs.module.scss";
import Chip from "@mui/material/Chip";
import axios from "axios";
import { Typography } from "@mui/material";

const chipStyles = { color: "white",backgroundColor:"lawngreen" ,"&:hover":{opacity:"0.6"}}

export default function AppliedJobs() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.session);
  const dispatch = useDispatch();

  const { data, error } = useSWR(
    [
      `${baseUrl}/vaccancy/connected/${user.id}`,
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
  return (
    <div className={styles.container}>
      <Typography variant="h6" component="h6" className={styles.header}>
          applied jobs
        </Typography>
      {data?.jobsApplied.map((item: any) => (
        <div key={item.id} className={styles.job}>
          <div className={styles.header}>
            <Typography variant="body1" component="div">
              {item.title}
            </Typography>
            {data?.refused?.jobsRefused.filter(
              (it: any) => it.id === item.id
            )[0] && <Chip sx={{ color: "red" }} label="not ready to invite" />}
            {data?.accepted?.jobsAccepted.filter(
              (it: any) => it.id === item.id
            )[0] && (
              <Chip
                sx={{ color: "lawngreen" , fontFamily: "Arial"}}
                label="invited, start conversation"
                onClick={() =>
                  router.push(`/candidate/chats/${item.recruiter.id}`)
                }
              />
            )}
            {!data?.refused?.jobsRefused.filter(
              (it: any) => it.id === item.id
            )[0] &&
              !data?.accepted?.jobsAccepted.filter(
                (it: any) => it.id === item.id
              )[0] && <Chip sx={{ color: "black" }} label="pending..." />}
          </div>
          <Typography
            color="text.secondary"
            variant="body2"
            component="div"
            className={styles.card}
          >
            {item.description}
          </Typography>
          <div>
            <Button
              sx={{
                fontWeight: "300",
                boxShadow: 0,
                textTransform: "lowercase",
                padding: "1px",
                color:"lawngreen"
              }}
              onClick={() => router.push(`/${item.id}`)}
            >
              read more
            </Button>
          </div>
          <div className={styles.footer}>
            <Chip sx={chipStyles} label="23 viewed" />
            <Chip sx={chipStyles} label="12 applied" />
          </div>
        </div>
      ))}
    </div>
  );
}
