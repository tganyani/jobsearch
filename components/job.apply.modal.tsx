import { useState } from "react";
import { useSWRConfig } from "swr";
import { useRouter } from "next/router";
import styles from "../styles/Modal.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import { io } from "socket.io-client";

import {
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import { RootState } from "@/store/store";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { baseUrl } from "@/baseUrl";
import { setCloseApply } from "@/store/slice/modalSlice";
import useSWR from "swr";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";

type Inputs = {
  message: string;
};

interface JobApplyProp {
  jobId: number;
  recruiter: {
    id: number;
    email: string;
  };
}

interface Letter {
  id: number;
  message: string;
}

const socket = io(`${baseUrl}`);

export default function JobApply({ jobId, recruiter }: JobApplyProp) {
  const router = useRouter();
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );
  const { mutate } = useSWRConfig();
  const [openPrevDiv, setOpenPrevDiv] = useState<boolean>(false);
  const open = useSelector((state: RootState) => state.modal.openApply);
  const user = useSelector((state: RootState) => state.session);
  const email = useSelector((state: RootState) => state.session.email);
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
    await axios
        .patch(`${baseUrl}/vaccancy/connect/${jobId}`, { ...data, id: user.id }, {
          headers: { Authorization: "Bearer " + user.access_token },
        })
        .then(async (res) => {
         await dispatch(setCloseApply())
         await  alert(res.data.message);
        }).catch(async err=>{
          if(err.request.status === 401){
            await axios.post(`${baseUrl}/candidates/refresh`,{refresh_token:user.refresh_token})
            .then(res=>{
              dispatch(setSession({...user,access_token:res.data.access_token}))
              if(!res.data.valid_access_token){
                dispatch(removeSession())
                router.push("/auth/signin")
              }
            })
          }
        });
    await socket.emit("createRoom", {
      candidateId: user.id,
      recruiterId: recruiter.id,
      name: roomName,
      message: data.message,
      accountType,
    });
  };
  const { data, error } = useSWR(
    [
      `${baseUrl}/vaccancy/letters/${user.id}`,
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

  const handleDeleteLetter = async (letterId: number) => {
    await axios
      await axios
        .delete(`${baseUrl}/vaccancy/letters/${letterId}`, {
          headers: { Authorization: "Bearer " + user.access_token },
        })
        .then((res) => {
        }).catch(async err=>{
          if(err.request.status === 401){
            await axios.post(`${baseUrl}/candidates/refresh`,{refresh_token:user.refresh_token})
            .then(res=>{
              dispatch(setSession({...user,access_token:res.data.access_token}))
              if(!res.data.valid_access_token){
                dispatch(removeSession())
                router.push("/auth/signin")
              }
            })
          }
        });
    await mutate([
      `${baseUrl}/vaccancy/letters/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  };

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setCloseApply())}
      className={styles.container}
      maxWidth="sm"
      fullWidth={true}
    >
      <DialogTitle>apply for a job</DialogTitle>
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
            {data?.length === 0 && (
              <div>You don't have previous letters yet!</div>
            )}
            {error && <div>Error fetching data</div>}
            {!data && <div>Loadind.......!</div>}
            {data &&
              data.map((item: Letter) => (
                <div key={item.id} className={styles.card}>
                  <AddIcon
                    className={styles.add}
                    onClick={() => {
                      reset({ message: item.message });
                      setOpenPrevDiv(false);
                    }}
                  />
                  <ClearIcon
                    className={styles.clear}
                    onClick={() => handleDeleteLetter(item.id)}
                  />
                  {item.message}
                </div>
              ))}
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
          apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
