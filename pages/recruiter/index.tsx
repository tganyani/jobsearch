import { useState } from "react";
import { baseUrl } from "@/baseUrl";
import { RootState } from "@/store/store";
import { useSelector, useDispatch } from "react-redux";
import useSWR from "swr";
import styles from "../../styles/Recruiter.module.scss";
import EditIcon from "@mui/icons-material/Edit";
import {
  setOpenAbout,
  setOpenAddress,
  setOpenCantact,
  setOpenImage,
  setOpenName,
} from "@/store/slice/recruiterModalSlice";
import EditRecruiterAbout from "@/components/recruiter/edit.about.modal";
import EditRecruiterContact from "@/components/recruiter/edit.contact.modal";
import EditRecruiterAddress from "@/components/recruiter/edit.address.modal";
import EditRecruiterProfileImage from "@/components/recruiter/edit.rectruiterProfile";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { Typography } from "@mui/material";
import EditRecruiterName from "@/components/recruiter/edit.name.modal";
import axios from "axios";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import { useRouter } from "next/router";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CallIcon from "@mui/icons-material/Call";
import EmailIcon from "@mui/icons-material/Email";
import WebIcon from "@mui/icons-material/Web";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TelegramIcon from "@mui/icons-material/Telegram";
import CircularProgress from "@mui/material/CircularProgress";

// const fetcher = (url: string) => fetch(url).then((res) => res.json());
const iconStyle = {
  color: "white",
  fontSize: "20px",
  transition: "all 0.5s ease-out",
  "&:hover": {
    opacity: "0.6",
    transform: "rotate(-40deg)",
    fontSize: "22px",
  },
};
export default function RecruiterProfile() {
  const [enlargeImg, setEnlargeImg] = useState<boolean>(true);
  const user = useSelector((state: RootState) => state.session);
  const session = useSelector((state: RootState) => state.session);
  const dispatch = useDispatch();
  const router = useRouter();

  const { data, error } = useSWR(
    [`${baseUrl}/recruiters/${user.id}`, user.access_token, user.refresh_token],
    async ([url, access_token, refresh_token]) =>
      await axios
        .get(url, { headers: { Authorization: "Bearer " + access_token } })
        .then((res) => res.data)
        .catch(async (err) => {
          if (err.request.status === 401) {
            await axios
              .post(`${baseUrl}/recruiters/refresh`, { refresh_token })
              .then((res) => {
                console.log(res.data);
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
  if (!data) return <div
  style={{
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "70px",
  }}
>
  <CircularProgress sx={{ color: "lawngreen" }} size="20px" />
</div>

  return (
    <div className={styles.container}>
      <div className={styles.name}>
        <div className={styles.inner}>
          <div className={styles.details}>
            <Typography variant="body1" component="div">
              {data?.firstName} {data?.lastName}
            </Typography>
            <Typography color="GrayText" variant="body2" component="div">
              {data?.companyName}
            </Typography>
          </div>
          <div className={styles.editIcon}>
            <div className={styles.iconDiv}>
              <EditRecruiterName
                name={{
                  firstName: data.firstName,
                  lastName: data.lastName,
                  companyName: data.companyName,
                }}
              />
              <EditIcon
                sx={iconStyle}
                onClick={() => dispatch(setOpenName())}
              />
            </div>
          </div>
        </div>
        <div className={styles.image}>
          {!data.image && (
            <div className={styles.iconDiv}>
              <AddPhotoAlternateIcon
                sx={iconStyle}
                onClick={() => dispatch(setOpenImage())}
              />
            </div>
          )}
          {data.image && (
            <img
              onClick={() => setEnlargeImg(!enlargeImg)}
              className={enlargeImg ? styles.img : styles.enlarge}
              src={`${baseUrl}${data.image}`}
              alt="profile"
            />
          )}
          <EditRecruiterProfileImage prevPath={data.image} />
          {data.image && (
            <div className={styles.iconDiv}>
              <InsertPhotoIcon
                sx={iconStyle}
                onClick={() => dispatch(setOpenImage())}
              />
            </div>
          )}
        </div>
      </div>
      <div className={styles.about}>
        <div className={styles.header}>
          <Typography variant="body1" component="div">
            about
          </Typography>

          <div className={styles.iconDiv}>
            <EditIcon sx={iconStyle} onClick={() => dispatch(setOpenAbout())} />
          </div>
        </div>
        <div className={styles.sub}>
          <Typography color="GrayText" variant="body2" component="div">
            {data?.about}
          </Typography>
        </div>

        <EditRecruiterAbout about={data?.about} />
      </div>
      <div className={styles.address}>
        <div className={styles.header}>
          <Typography variant="body1" component="div">
            address
          </Typography>
          <div className={styles.iconDiv}>
            <EditIcon
              sx={iconStyle}
              onClick={() => dispatch(setOpenAddress())}
            />
          </div>
        </div>
        <div className={styles.sub}>
          <Typography color="GrayText" variant="body2" component="div">
            {data?.street},{data?.city},{data?.country}
          </Typography>
        </div>
        <EditRecruiterAddress
          address={{
            city: data?.city,
            country: data?.country,
            street: data?.street,
          }}
        />
      </div>
      <div className={styles.contacts}>
        <div className={styles.header}>
          <Typography variant="body1" component="div">
            contacts
          </Typography>
          <div className={styles.iconDiv}>
            <EditIcon
              sx={iconStyle}
              onClick={() => dispatch(setOpenCantact())}
            />
          </div>
        </div>
        <div className={styles.sub}>
          {data?.phone && (
            <Chip
              variant="outlined"
              size="small"
              avatar={
                <Avatar sx={{ backgroundColor: "#eeeeee" }}>
                  <CallIcon sx={{ color: "#00FF00", fontSize: "15px" }} />
                </Avatar>
              }
              label={data?.phone}
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
          {data?.website && (
            <a href={data?.website}>
              <Chip
                size="small"
                variant="outlined"
                clickable
                avatar={
                  <Avatar sx={{ backgroundColor: "#eeeeee" }}>
                    <WebIcon sx={{ color: "#5C7CFA", fontSize: "15px" }} />
                  </Avatar>
                }
                label="website"
              />
            </a>
          )}

          {data?.linkedIn && (
            <a href={data?.linkedIn}>
              <Chip
                size="small"
                variant="outlined"
                clickable
                avatar={
                  <Avatar sx={{ backgroundColor: "#eeeeee" }}>
                    <LinkedInIcon sx={{ color: "#0A66C2", fontSize: "15px" }} />
                  </Avatar>
                }
                label="linked in"
              />
            </a>
          )}

          {data?.telegram && (
            <a href={data?.telegram}>
              <Chip
                size="small"
                variant="outlined"
                clickable
                avatar={
                  <Avatar sx={{ backgroundColor: "#eeeeee" }}>
                    <TelegramIcon sx={{ color: "#27A7E7", fontSize: "15px" }} />
                  </Avatar>
                }
                label="telegram"
              />
            </a>
          )}
        </div>
        <EditRecruiterContact
          contacts={{
            phone: data?.phone,
            telegram: data?.telegram,
            website: data?.website,
            linkedIn: data?.linkedIn,
          }}
        />
      </div>
    </div>
  );
}
