import { useEffect, useState } from "react";
import styles from "../../styles/CandidateProfile.module.scss";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import useSWR, { mutate } from "swr";
import axios from "axios";

import EditIcon from "@mui/icons-material/Edit";

import { baseUrl } from "@/baseUrl";
import EditName from "@/components/edit.name.modal";
import {
  setOpenAbout,
  setOpenContact,
  setOpenEdu,
  setOpenImage,
  setOpenName,
  setOpenPrevPos,
  setOpenProject,
  setOpenSkill,
} from "@/store/slice/modalSlice";
import EditEdu from "@/components/edit.education.modal";
import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import type { Edu } from "@/components/edit.education.modal";
import EditPrevPositions, { Pos } from "@/components/edit.prevPositions.modal";
import EditSkill from "@/components/edit.skills.modal";
import EditProjects, { Proj } from "@/components/edit.projects.modal";
import EditContacts from "@/components/edit.contacts.modal";
import EditCandidateProfileImage from "@/components/edit.candidateProfileImage";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditCandateAbout from "@/components/edit.candidate.about";

import { setSession, removeSession } from "@/store/slice/sessionSlice";
import { useRouter } from "next/router";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";

// const fetcher = (url: string) => fetch(url).then((res) => res.json());

function groupIntoChunks(array: any, chunkSize: any) {
  const output: any = [];
  let currentChunk: any = [];

  array.forEach((item: any, index: any) => {
    currentChunk.push(item);

    if ((index + 1) % chunkSize === 0 || index === array.length - 1) {
      output.push(currentChunk);
      currentChunk = [];
    }
  });

  return output;
}

export default function CandidateProfile() {
  const router = useRouter();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editPrev, setEditPrev] = useState<boolean>(false);
  const [editProject, setEditProject] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(0);
  const [enlargeImg, setEnlargeImg] = useState<boolean>(true);
  const id = useSelector((state: RootState) => state.session.id);
  const user = useSelector((state: RootState) => state.session);
  const dispatch = useDispatch();
  // Determine if it's a mobile or tablet device
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  // Determine the chunk size based on device
  const chunkSize = isTablet ? (isMobile ? 1 : 2) : 3;

  const { data, error } = useSWR(
    [`${baseUrl}/candidates/${id}`, user.access_token, user.refresh_token],
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
      <div className={styles.topNav}>
        <div className={styles.name}>
          <div className={styles.sub}>
            <Typography
              variant="body1"
              component="div"
              className={styles.value}
            >
              {data?.firstName}
            </Typography>
            <Typography
              color="text.secondary"
              variant="body2"
              component="div"
              className={styles.value}
            >
              {data.position}
            </Typography>
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <LocationOnIcon sx={{ color: "lawngreen", fontSize: "20px" }} />
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="div"
                  className={styles.value}
                >
                  {data.city},{data.country}
                </Typography>
              </div>
            </div>
          </div>
          <div className={styles.editIcon}>
            <EditIcon
              sx={{ color: "white" }}
              onClick={() => dispatch(setOpenName())}
            />
          </div>
          <EditName
            profile={{
              position: data.position,
              city: data.city,
              country: data.country,
            }}
          />
        </div>
        <div className={styles.image}>
          {!data.image && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "lawngreen",
                width:"30px",
                height:"30px",
                borderRadius:"15px"
              }}
            >
              <AddPhotoAlternateIcon
              sx={{color:"white"}}
                style={{ fontSize: "25px" }}
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
          <EditCandidateProfileImage prevPath={data.image} />
          {data.image && (
            <div className={styles.editContaier}>
              <div className={styles.editIcon}>
                <InsertPhotoIcon
                  sx={{ color: "white" }}
                  onClick={() => dispatch(setOpenImage())}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.about}>
        <div className={styles.header}>
          <Typography variant="h6" component="h6">
            about
          </Typography>
          <div className={styles.editIcon}>
            <EditIcon
              sx={{ color: "white" }}
              onClick={() => dispatch(setOpenAbout())}
            />
          </div>
        </div>
        <Typography
          color="text.secondary"
          variant="body2"
          component="div"
          className={styles.value}
        >
          {data.about}
        </Typography>
        <EditCandateAbout about={data.about} />
      </div>
      <div className={styles.edu}>
        <div className={styles.header}>
          <Typography variant="h6" component="h6">
            education
          </Typography>
          <div className={styles.editIcon}>
            <AddIcon
              sx={{ color: "white" }}
              onClick={() => dispatch(setOpenEdu())}
            />
          </div>
        </div>
        <div className={styles.sub}>
          {data?.education.map((edu: Edu, i: number) => (
            <div
              key={edu.id}
              style={{
                display: "flex",
                flexFlow: "row nowrap",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className={styles.education}>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="div"
                  className={styles.value}
                >
                  {edu.schoolName}
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="div"
                  className={styles.value}
                >
                  {edu.startDate} / {edu.endDate}
                </Typography>
                <div className={styles.editIcon}>
                  <EditIcon
                    sx={{ color: "white" }}
                    onClick={() => {
                      dispatch(setOpenEdu());
                      setEditMode(true);
                      setIndex(edu.id);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <EditEdu
            edu={data?.education.filter((item: Edu) => item.id === index)[0]}
            editMode={editMode}
            setEditMode={setEditMode}
          />
        </div>
      </div>
      <div className={styles.prevPos}>
        <div className={styles.header}>
          <Typography variant="h6" component="h6">
            previous positions
          </Typography>

          <div className={styles.editIcon}>
            <AddIcon
              sx={{ color: "white" }}
              onClick={() => dispatch(setOpenPrevPos())}
            />
          </div>
        </div>
        <div className={styles.sub}>
          {data?.previousPosition.map((item: Pos, i: number) => (
            <div key={item.id} className={styles.inner}>
              <div className={styles.prev}>
                <div className={styles.top}>
                  <Typography variant="body1" component="div">
                    company name
                  </Typography>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    component="div"
                    className={styles.value}
                  >
                    {item.companyName}
                  </Typography>
                  <Typography variant="body1" component="div">
                    position
                  </Typography>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    component="div"
                    className={styles.value}
                  >
                    {item.position}
                  </Typography>
                  <Typography variant="body1" component="div">
                    duration
                  </Typography>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    component="div"
                    className={styles.value}
                  >
                    {item.startDate}
                    {"    "}/{"   "} {item.endDate}
                  </Typography>
                </div>
              </div>
              <div className={styles.editIcon}>
                <EditIcon
                  sx={{ color: "white" }}
                  onClick={() => {
                    dispatch(setOpenPrevPos());
                    setEditPrev(true);
                    setIndex(item.id);
                  }}
                />
              </div>
            </div>
          ))}
          <EditPrevPositions
            pos={
              data?.previousPosition.filter((item: Pos) => item.id === index)[0]
            }
            editMode={editPrev}
            setEditMode={setEditPrev}
          />
        </div>
      </div>
      <div className={styles.skills}>
        <div className={styles.header}>
          <Typography variant="h6" component="h6">
            skills
          </Typography>
          <div className={styles.editIcon}>
            <AddIcon
              sx={{ color: "white" }}
              onClick={() => dispatch(setOpenSkill())}
            />
          </div>
        </div>
        <div className={styles.sub}>
          {data?.skills.map((item: any) => (
            <div key={item.id} className={styles.skill}>
              <Typography
                color="text.secondary"
                variant="body2"
                component="div"
              >
                {item.title}
              </Typography>
              <Typography
                color="text.secondary"
                className={styles.span}
                variant="body2"
                component="div"
              >
                {item.experience}y
              </Typography>
            </div>
          ))}
        </div>
        <EditSkill skills={data?.skills} />
      </div>
      <div className={styles.projects}>
        <div className={styles.header}>
          <Typography variant="h6" component="h6">
            projects
          </Typography>
          <div className={styles.addIcon}>
            <AddIcon
              sx={{ color: "white" }}
              onClick={() => dispatch(setOpenProject())}
            />
          </div>
        </div>
        <div className={styles.sub}>
          {data?.projects.map((item: any) => (
            <div key={item.id} className={styles.inner}>
              <div className={styles.title}>
                <Typography variant="body1" component="div">
                  {item.title}
                </Typography>
                <div className={styles.editIcon}>
                  <EditIcon
                    sx={{ color: "white" }}
                    onClick={() => {
                      dispatch(setOpenProject());
                      setEditProject(true);
                      setIndex(item.id);
                    }}
                  />
                </div>
              </div>
              <div className={styles.description}>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  component="div"
                >
                  {item.description}
                </Typography>
              </div>

              <Carousel>
                {groupIntoChunks(item?.images, chunkSize).map(
                  (imgGroup: any, groupIndex: any) => (
                    <div
                      key={groupIndex}
                      style={{
                        display: "flex",
                        flexFlow: "row nowrap",
                        justifyContent: "space-around",
                      }}
                    >
                      {imgGroup?.map((image: any) => (
                        <div key={image.id}>
                          <img
                            style={{ width: "200px", height: "200px" }}
                            src={`${baseUrl}${image.url}`}
                            alt="project-image"
                          />
                        </div>
                      ))}
                    </div>
                  )
                )}
              </Carousel>
              <div className={styles.link}>
                <a href={item.link}>
                  <OpenInNewIcon sx={{ color: "lawngreen" }} />
                </a>
              </div>
            </div>
          ))}
        </div>
        <EditProjects
          project={data?.projects.filter((item: Proj) => item.id === index)[0]}
          editMode={editProject}
          setEditMode={setEditProject}
        />
      </div>
      <div className={styles.contacts}>
        <div className={styles.header}>
          <Typography variant="h6" component="h6">
            contacts
          </Typography>
          <div className={styles.editIcon}>
            <EditIcon
              sx={{ color: "white" }}
              onClick={() => {
                dispatch(setOpenContact());
              }}
            />
          </div>
        </div>
        <div className={styles.sub}>
          <div className={styles.contact}>
            <Typography
              className={styles.type}
              color="text.secondary"
              variant="body2"
              component="div"
            >
              {data?.contacts?.email}
            </Typography>
            <Typography
              className={styles.type}
              color="text.secondary"
              variant="body2"
              component="div"
            >
              {data?.contacts?.phone}
            </Typography>
          </div>
        </div>
        <EditContacts
          contacts={{
            phone: data?.contacts?.phone,
            email: data?.contacts?.email,
          }}
        />
      </div>
    </div>
  );
}
