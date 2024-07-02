import { useState, useEffect, Fragment } from "react";
import { useForm } from "react-hook-form";
import { baseUrl } from "@/baseUrl";
import { RootState } from "@/store/store";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import useSWR, { useSWRConfig } from "swr";
import { setSession, removeSession } from "@/store/slice/sessionSlice";

import styles from "../../../styles/AllVaccancy.module.scss";

import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CircularProgress from "@mui/material/CircularProgress";

import axios from "axios";

type Inputs = {
  position: string;
  country: string;
  city: string;
};

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export default function AllVaccancy() {
  const matches = useMediaQuery("(max-width:700px)");
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const dispatch = useDispatch();
  const { register, watch, reset } = useForm<Inputs>();
  const [open, setOpen] = useState(false);
  const [jobId, setJobId] = useState<number>();
  const [jobTitle, setJobTitle] = useState<string>();
  const user = useSelector((state: RootState) => state.session);
  const [Jobs, setJobs] = useState([]);
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { data, error } = useSWR(
    [
      `${baseUrl}/vaccancy/posted/${user.id}`,
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

  useEffect(() => {
    setJobs(data?.jobsPosted?.map((item: any) => ({ ...item, open: false })));
  }, [data]);

  useEffect(() => {
    const fetchMatchedJobs = async () => {
      await axios
        .get(
          `${baseUrl}/candidates?country=${watch("country")}&city=${watch(
            "city"
          )}&position=${watch("position")}`,
          { headers: { Authorization: "Bearer " + user.access_token } }
        )
        .then((res) => {
          setMatchedUsers(res.data);
        })
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
    };
    fetchMatchedJobs();
  }, [watch("position"), watch("city"), watch("country")]);

  const handleClickOpen = (id: number) => {
    setJobs(
      data?.jobsPosted?.map((item: any) => {
        if (Number(item.id) === id) {
          return {
            ...item,
            open: true,
          };
        } else {
          return item;
        }
      })
    );
    reset({
      position: data?.jobsPosted?.filter(
        (item: any) => Number(item.id) === Number(id)
      )[0].title,
      country: data?.jobsPosted?.filter(
        (item: any) => Number(item.id) === Number(id)
      )[0].country,
      city: data?.jobsPosted?.filter(
        (item: any) => Number(item.id) === Number(id)
      )[0].city,
    });
  };

  const handleClose = (id: number) => {
    setJobs(
      data?.jobsPosted?.map((item: any) => {
        if (Number(item.id) === id) {
          return {
            ...item,
            open: false,
          };
        } else {
          return item;
        }
      })
    );
  };

  const handleClickOpenDeleteModal = (id: number, title: string) => {
    setOpen(true);
    setJobId(id);
    setJobTitle(title);
  };

  const handleCloseDeleteModal = () => {
    setOpen(false);
  };

  const handleDeleteJob = async () => {
    await setLoading(true);
    await axios
      .delete(`${baseUrl}/vaccancy/${jobId}`, {
        headers: { Authorization: "Bearer " + user.access_token },
      })
      .then(async (res) => {
        await mutate([
          `${baseUrl}/vaccancy/posted/${user.id}`,
          user.access_token,
          user.refresh_token,
        ]);
        setOpen(false);
      })
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
    await setLoading(false);
  };

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <div className={styles.container}>
      <Typography variant="h6" component="div">
        All vaccancies posted
      </Typography>
      {Jobs?.map((item: any) => (
        <div className={styles.vaccancy} key={item.id}>
          <div className={styles.header}>
            <Typography variant="body1" component="div" className={styles.h4}>
              {item.title}
            </Typography>
            <div className={styles.searchCandidate}>
              <Chip
                label="potential candidates"
                component="a"
                variant="outlined"
                clickable
                onClick={() => handleClickOpen(Number(item.id))}
                sx={{
                  width: "170px",
                  display: "flex",
                  flexFlow: "row nowrap",
                  justifyContent: "space-between",
                  "&:hover": { color: "lawngreen", borderColor: "lawngreen" },
                }}
                avatar={
                  <Avatar sx={{ backgroundColor: "lawngreen" }}>
                    <SearchIcon sx={{ color: "white" }} />
                  </Avatar>
                }
              />
              <Dialog
                fullScreen={matches}
                open={item.open}
                onClose={handleClose}
              >
                <DialogTitle>Search for potential candidates</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Find potential candidates with skills which match{" "}
                    <span style={{ fontWeight: "bold" }}>{item.title}</span>{" "}
                    position
                  </DialogContentText>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="job title"
                    type="text"
                    fullWidth
                    variant="standard"
                    {...register("position")}
                  />
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="country"
                    type="text"
                    fullWidth
                    variant="standard"
                    {...register("country")}
                  />
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="city"
                    type="text"
                    fullWidth
                    variant="standard"
                    {...register("city")}
                  />
                  {matchedUsers.map((user: any) => (
                    <List
                      key={user.id}
                      sx={{
                        width: "100%",
                        bgcolor: "background.paper",
                        "&:hover": {
                          opacity: 0.5,
                        },
                      }}
                      onClick={() =>
                        router.push(`/recruiter/vaccancy/${item.id}/${user.id}`)
                      }
                    >
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar
                            alt={user.firstName?.toUpperCase()}
                            src={`${baseUrl}${user.image}`}
                            sx={{ bgcolor: stringToColor(user.firstName) }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.firstName}
                          sx={{ textTransform: "capitalize" }}
                          secondary={
                            <Fragment>
                              <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="text.secondary"
                              >
                                {user.position},
                              </Typography>
                              {user.city}, {user.country}
                            </Fragment>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </List>
                  ))}
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => handleClose(Number(item.id))}
                    variant="contained"
                    sx={{
                      height: "25px",
                      textTransform: "lowercase",
                      fontWeight: "300",
                      boxShadow: 0,
                      borderRadius: "12px",
                    }}
                  >
                    close
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </div>
          <Typography
            variant="body2"
            component="div"
            className={styles.description}
            color="GrayText"
          >
            {item.description}
          </Typography>
          <Button
            sx={{
              fontWeight: "300",
              boxShadow: 0,
              textTransform: "lowercase",
              padding: "1px",
              color: "lawngreen",
              width: "100px",
            }}
            onClick={() =>
              router.push(`/recruiter/vaccancy/preview/${item.id}`)
            }
          >
            read more ...
          </Button>
          <div className={styles.bottom}>
            <div className={styles.clm1}>
              <Chip
                avatar={
                  <Avatar sx={{ backgroundColor: "lawngreen" }}>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{ color: "white" }}
                    >
                      {item.candidatesApplied.length}
                    </Typography>
                  </Avatar>
                }
                label="candidates applied"
                variant="outlined"
                sx={{ width: "160px" }}
              />
              {item.candidatesApplied.length > 0 && (
                <Chip
                  label="view candidates"
                  component="a"
                  variant="outlined"
                  clickable
                  onClick={() => router.push(`/recruiter/vaccancy/${item.id}`)}
                  sx={{
                    width: "160px",
                    display: "flex",
                    flexFlow: "row nowrap",
                    justifyContent: "space-between",
                    "&:hover": { color: "lawngreen", borderColor: "lawngreen" },
                  }}
                  avatar={
                    <Avatar sx={{ backgroundColor: "lawngreen" }}>
                      <ArrowOutwardIcon sx={{ color: "white" }} />
                    </Avatar>
                  }
                />
              )}
            </div>
            <Chip
              label="delete vaccancy"
              component="a"
              variant="outlined"
              clickable
              onClick={() =>
                handleClickOpenDeleteModal(Number(item.id), item.title)
              }
              sx={{
                width: "170px",
                display: "flex",
                flexFlow: "row nowrap",
                justifyContent: "space-between",
                "&:hover": { color: "tomato", borderColor: "tomato" },
              }}
              avatar={
                <Avatar sx={{ backgroundColor: "tomato" }}>
                  <DeleteOutlineIcon sx={{ color: "white" }} />
                </Avatar>
              }
            />
          </div>
        </div>
      ))}
      <Dialog
        open={open}
        onClose={handleCloseDeleteModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">delete vaccancy</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete{" "}
            <span style={{ fontWeight: "600" }}>{jobTitle}</span>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteModal}
            variant="contained"
            sx={{
              height: "25px",
              textTransform: "lowercase",
              fontWeight: "300",
              boxShadow: 0,
              borderRadius: "12px",
            }}
          >
            cancel
          </Button>
          <Button
            onClick={handleDeleteJob}
            autoFocus
            variant="contained"
            color="error"
            sx={{
              height: "25px",
              textTransform: "lowercase",
              fontWeight: "300",
              boxShadow: 0,
              borderRadius: "12px",
            }}
          >
            {loading ? (
              <CircularProgress sx={{ color: "white" }} size="20px" />
            ) : (
              "delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
