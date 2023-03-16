import { useState, useEffect, Fragment } from "react";
import { useForm } from "react-hook-form";
import { baseUrl } from "@/baseUrl";
import { RootState } from "@/store/store";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import useSWR,{ useSWRConfig } from "swr";

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
import Typography from "@mui/material/Typography";
import useMediaQuery from '@mui/material/useMediaQuery';
import axios from "axios";


const fetcher = (url: string) => fetch(url).then((res) => res.json());
type Inputs = {
  position: string;
  country: string;
  city: string;
};

export default function AllVaccancy() {
  const matches = useMediaQuery('(max-width:700px)');
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const { register, watch, reset } = useForm<Inputs>();
  const [open, setOpen] = useState(false);
  const [jobId, setJobId] = useState<number>();
  const [jobTitle, setJobTitle] = useState<string>();
  const id = useSelector((state: RootState) => state.session.id);
  const [Jobs, setJobs] = useState([]);
  const [matchedUsers, setMatchedUsers] = useState([]);

  const { data, error } = useSWR(`${baseUrl}/vaccancy/posted/${id}`, fetcher);

  useEffect(() => {
    setJobs(data?.jobsPosted?.map((item: any) => ({ ...item, open: false })));
  }, [data]);

  useEffect(() => {
    const fetchMatchedJobs = async () => {
      await axios
        .get(
          `${baseUrl}/candidates?country=${watch("country")}&city=${watch(
            "city"
          )}&position=${watch("position")}`
        )
        .then((res) => {
          setMatchedUsers(res.data);
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

  const handleDeleteJob = async ()=>{
    await axios.delete(`${baseUrl}/vaccancy/${jobId}`)
    .then(async res=>{
      await mutate(`${baseUrl}/vaccancy/posted/${id}`)
      setOpen(false)
    })
  }

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <div className={styles.container}>
      {Jobs?.map((item: any) => (
        <div className={styles.vaccancy} key={item.id}>
          <div className={styles.header}>
            <Link href={`/recruiter/vaccancy/preview/${item.id}`}>
              <h4>{item.title}</h4>
            </Link>
            <div className={styles.searchCandidate}>
              <div
                className={styles.searchIcon}
                onClick={() => handleClickOpen(Number(item.id))}
              >
                <SearchIcon /> <p>potential candidates</p>
              </div>
              <Dialog fullScreen={matches} open={item.open} onClose={handleClose}>
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
                            alt={user.firstName}
                            src={`${baseUrl}${user.image}`}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.firstName}
                          secondary={
                            <Fragment>
                              <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="text.primary"
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
                  <Button onClick={() => handleClose(Number(item.id))}
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
          <div className={styles.description}>{item.description}</div>
          <div className={styles.bottom}>
            <div className={styles.clm1}>
              <p>{item.candidatesApplied.length} candidates applied </p>
              <Link href={`/recruiter/vaccancy/${item.id}`}>
                view candidates
              </Link>
            </div>
            <Button
              color="error"
              className={styles.clm2}
              sx={{
                height: "25px",
                textTransform: "lowercase",
                fontWeight: "300",
                boxShadow: 0,
                borderRadius: "12px",
                width:"170px"
              }}
              variant="contained"
              onClick={() =>
                handleClickOpenDeleteModal(Number(item.id), item.title)
              }
            >
              delete vaccancy
            </Button>
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
            delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
