import { useSWRConfig } from "swr";
import styles from "../styles/Modal.module.scss";
import { useDispatch, useSelector } from "react-redux";

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
import { useEffect, useState } from "react";
import { setCloseAbout } from "@/store/slice/modalSlice";
import { removeSession,setSession } from "@/store/slice/sessionSlice";
import { useRouter } from "next/router";
import CircularProgress from '@mui/material/CircularProgress';

type Inputs = {
  about: string;
};

export default function EditCandateAbout({ about }: Inputs) {
  const { mutate } = useSWRConfig();
  const [loading,setLoading] = useState<boolean>(false)
  const router = useRouter()
  // const { mutate } = useSWRConfig();
  const open = useSelector((state: RootState) => state.modal.openAbout);
  const user = useSelector((state: RootState) => state.session);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true)
    await axios
      .patch(`${baseUrl}/candidates/about/${user.id}`, data, {
        headers: { Authorization: "Bearer " + user.access_token },
      })
      .then((res) => {
        setLoading(false)
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
    await dispatch(setCloseAbout());
    await mutate([`${baseUrl}/candidates/${user.id}`,user.access_token,user.refresh_token])
  };
  useEffect(() => {
    reset({
      about,
    });
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setCloseAbout())}
      className={styles.container}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>about</DialogTitle>
      <DialogContent className={styles.content}>
        <DialogContentText>Are you sure you want to edit?</DialogContentText>
        <TextField
        sx={{width:"100%"}}
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="about"
          type="text"
          size="small"
          multiline
          minRows={3}
          defaultValue={about}
          {...register("about")}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            dispatch(setCloseAbout());
          }}
          className={styles.btn}
          color="success"
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} className={styles.btn}>
          {
            loading?<CircularProgress color="primary" size="20px" />:"update"
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}
