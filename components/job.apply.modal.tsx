import { useState } from "react";
import { useSWRConfig } from "swr";
import { useRouter } from "next/router";
import styles from "../styles/Modal.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import { io } from "socket.io-client";
import CircularProgress from "@mui/material/CircularProgress";
import useMediaQuery from "@mui/material/useMediaQuery";


import {
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { RootState } from "@/store/store";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { baseUrl } from "@/baseUrl";
import { setCloseApply } from "@/store/slice/modalSlice";
import Chip from "@mui/material/Chip";
import { Typography } from "@mui/material";
import useSWR from "swr";

type Inputs = {
  message: string;
};

interface JobApplyProp {
  jobId: number;
  jobTitle: string;
  firstName: string;
  lastName: string;
  recruiter: {
    id: number;
    email: string;
  };
}

const socket = io(`${baseUrl}`);

export default function JobApply({
  jobId,
  jobTitle,
  firstName,
  lastName,
  recruiter,
}: JobApplyProp) {
  const router = useRouter();
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );
  const { mutate } = useSWRConfig();
  const [openPrevDiv, setOpenPrevDiv] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [connectResponse, setConnectResponse] = useState<{message:string,connected:boolean}>({message:"",connected:false})
  const open = useSelector((state: RootState) => state.modal.openApply);
  const user = useSelector((state: RootState) => state.session);
  const email = useSelector((state: RootState) => state.session.email);
  const matches = useMediaQuery("(max-width:600px)");
  const roomName =
    email < recruiter?.email
      ? "".concat(email, recruiter?.email)
      : "".concat(recruiter?.email, email);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await setLoading(true);
    await axios
      .patch(
        `${baseUrl}/vaccancy/connect/${jobId}`,
        { ...data, id: user.id },
        {
          headers: { Authorization: "Bearer " + user.access_token },
        }
      )
      .then(async (res) => {
        
        setConnectResponse({...res?.data})
      })
      .catch(async (err) => {
        if (err.request.status === 401) {
          await axios
            .post(`${baseUrl}/candidates/refresh`, {
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
    await socket.emit("createRoom", {
      candidateId: user.id,
      recruiterId: recruiter.id,
      name: roomName,
      message: data.message,
      accountType,
      apply: true,
      jobId,
      jobTitle,
      lastName,
      firstName,
    });
    socket.emit("newView", { candidateId: user.id });
    setLoading(false);
    setTimeout(()=>{
      setConnectResponse({message:"",connected:false})
      dispatch(setCloseApply());
    },3000)
  };
  const { data, error } = useSWR(
    [
      `${baseUrl}/candidates/letter/${user.id}`,
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

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setCloseApply())}
      className={styles.container}
      maxWidth="sm"
      fullScreen={matches?true:false}
      fullWidth={true}
    >
      <DialogTitle>apply for a job</DialogTitle>
      {connectResponse.message&&<Alert variant="filled" severity={connectResponse.connected?"success":"error"}>
        {connectResponse.message} jiiiiiii
      </Alert>}
      <DialogContent className={styles.content} style={{ padding: "5px" }}>
        <DialogContentText>Are you sure you want to apply?</DialogContentText>
        <TextField
          className={styles.inputAppy}
          autoFocus
          margin="dense"
          id="name"
          label="letter"
          type="text"
          size="small"
          multiline
          rows={5}
          InputLabelProps={{
            shrink: true,
          }}
          placeholder="write something to the recruiter"
          {...register("message", { required: true })}
        />
        {errors.message && (
          <span style={{ color: "red", width: "100%" }}>
            This field is required
          </span>
        )}
        <div className={styles.prevLetter}>
          <Button
            className={styles.btn}
            onClick={() => setOpenPrevDiv(!openPrevDiv)}
          >
            insert previous letter
          </Button>
          <div className={openPrevDiv ? styles.letter : styles.closeLetter}>
            {!data?.letter && (
              <Typography variant="body1" component="div">
                You don't have previous letters yet!
              </Typography>
            )}
            <div>
              <Chip
                sx={{
                  width: "100%",
                  height: "auto",
                  padding: "5px",
                  "& .MuiChip-label": {
                    display: "block",
                    whiteSpace: "normal",
                  },
                }}
                label={data?.letter}
                onClick={() => reset({ message: data?.letter })}
              />
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            dispatch(setCloseApply());
          }}
          className={styles.btn}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} className={styles.btn}>
          {loading ? (
            <CircularProgress sx={{ color: "lawngreen" }} size="20px" />
          ) : (
            "apply"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
