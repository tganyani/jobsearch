import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import { baseUrl } from "@/baseUrl";
import styles from "../../../../styles/Applicants.module.scss";
import Button from "@mui/material/Button";
import axios from "axios";
import { Link } from "@mui/material";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { io } from "socket.io-client";
import { RootState } from "@/store/store";
import { Typography } from "@mui/material";

const socket = io(`${baseUrl}`);

export default function Applicants() {
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentLoading, setCurrentLoading] = useState<number>();
  const [loadingAccept, setLoadingAccept] = useState<boolean>(false);
  const user = useSelector((state: RootState) => state.session);
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );
  const dispatch = useDispatch();
  const vaccancyId = router.query.vaccancyId;

  const { data, error } = useSWR(
    [
      `${baseUrl}/vaccancy/${vaccancyId}`,
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
  const handleAccept = async (
    candidateId: string | any,
    chatId: number | any,
    firstName: string | any,
    companyName: string | any,
    fName: string | any,
    lName: string | any,
    roomId: number | any,
    roomName: string | any
  ) => {
    setCurrentLoading(Number(candidateId));
    setLoadingAccept(true);

    await axios
      .post(
        `${baseUrl}/vaccancy/accept/${candidateId}`,
        { id: vaccancyId },
        {
          headers: { Authorization: "Bearer " + user.access_token },
        }
      )
      .then((res) => {})
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
    await mutate([
      `${baseUrl}/vaccancy/${vaccancyId}`,
      user.access_token,
      user.refresh_token,
    ]);
    await socket.emit("sendInvitationMsg", {
      chatId,
      firstName,
      companyName,
      fName,
      lName,
      vaccancyId,
      roomId,
      jobTitle: data?.title,
      candidateId,
    });
    await socket.emit("newMsg", {
      message: `You have recieved an  initation from ${companyName}, view more details about the job at https://jobsearch-lemon.vercel.app/${vaccancyId}  .Start conversation https://jobsearch-lemon.vercel.app/candidate/chats/${roomId} . With all respect ${fName} ${lName} `,
      roomId,
      roomName,
      accountType,
    });
    setLoadingAccept(false);
  };
  const handleRefuse = async (
    candidateId: string | any,
    chatId: number | any,
    firstName: string | any,
    companyName: string | any,
    fName: string | any,
    lName: string | any,
    roomName: string | any,
    roomId: number | any
  ) => {
    setCurrentLoading(Number(candidateId));
    setLoading(true);
    await axios
      .post(
        `${baseUrl}/vaccancy/refuse/${candidateId}`,
        { id: vaccancyId },
        {
          headers: { Authorization: "Bearer " + user.access_token },
        }
      )
      .then((res) => {})
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
    await mutate([
      `${baseUrl}/vaccancy/${vaccancyId}`,
      user.access_token,
      user.refresh_token,
    ]);
    await socket.emit("sendRefusalMsg", {
      chatId,
      firstName,
      companyName,
      fName,
      lName,
      vaccancyId,
      roomId,
      jobTitle: data?.title,
      candidateId,
    });
    await socket.emit("newMsg", {
      message: `For now we are not ready to invite you at ${companyName} for this postion  https://jobsearch-lemon.vercel.app/${vaccancyId} , we have carefully viewed your profile, but this should not stop you from applying when we post new vaccancies . With all  respect ${fName} ${lName} `,
      roomId,
      roomName,
      accountType,
    });
    setLoading(false);
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="body1" color="GrayText" component="div">
          candidates who have applied for a <span>{data.title}</span> position
        </Typography>
      </div>
      <div className={styles.applicants}>
        {data?.candidatesApplied.map((item: any) => (
          <div key={item.id} className={styles.applicant}>
            <div
              style={{
                display: "flex",
                flexFlow: "row nowrap",
                columnGap: "20px",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body1" component="div">
                {" "}
                {item.lastName} {item.firstName}
              </Typography>
              <Chip
                label="start conversation"
                sx={{ color: "limegreen" }}
                onClick={() =>
                  router.push(
                    `/recruiter/chats/${
                      data?.recruiter.rooms.filter(
                        (rm: any) => rm.candidateId === item.id
                      )[0].id
                    }`
                  )
                }
              />
            </div>
            <div className={styles.name}>
              <Typography
                variant="body2"
                color="GrayText"
                component="div"
                sx={{
                  whiteSpace: "nowrap",
                  // maxWidth: "150px",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {item?.about}
              </Typography>
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
                    data?.recruiter?.lastName,
                    data?.recruiter?.rooms?.filter(
                      (room: any) => room.candidateId === item.id
                    )[0].id,
                    data?.recruiter?.rooms?.filter(
                      (room: any) => room.candidateId === item.id
                    )[0].name
                  )
                }
                disabled={
                  item?.accepted?.jobsAccepted.filter(
                    (it: any) => Number(it.id) === Number(vaccancyId)
                  ).length
                }
              >
                {loadingAccept && Number(item.id) === currentLoading ? (
                  <CircularProgress size="20px" sx={{ color: "white" }} />
                ) : item?.accepted?.jobsAccepted.filter(
                    (it: any) => Number(it.id) === Number(vaccancyId)
                  ).length ? (
                  "invited"
                ) : (
                  "invite"
                )}
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
                onClick={() =>
                  handleRefuse(
                    item.id,
                    item?.telegram?.chatId,
                    item?.telegram?.firstName,
                    data?.companyName,
                    data?.recruiter?.firstName,
                    data?.recruiter?.lastName,
                    data?.recruiter?.rooms?.filter(
                      (room: any) => room.candidateId === item.id
                    )[0].name,
                    data?.recruiter?.rooms?.filter(
                      (room: any) => room.candidateId === item.id
                    )[0].id
                  )
                }
                disabled={
                  item?.refused?.jobsRefused.filter(
                    (it: any) => Number(it.id) === Number(vaccancyId)
                  ).length > 0
                }
              >
                {loading && Number(item.id) === currentLoading ? (
                  <CircularProgress size="20px" sx={{ color: "white" }} />
                ) : item?.refused?.jobsRefused.filter(
                    (it: any) => Number(it.id) === Number(vaccancyId)
                  ).length ? (
                  "refused"
                ) : (
                  " not ready"
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
