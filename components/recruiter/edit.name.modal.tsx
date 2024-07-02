import { useSWRConfig } from "swr";
import styles from "../../styles/Modal.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";


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
import { useEffect } from "react";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import { useRouter } from "next/router";
import { setCloseName } from "@/store/slice/modalSlice";
import CircularProgress from "@mui/material/CircularProgress";

type Inputs = {
    firstName:string,
    lastName:string,
    companyName:string,
};

type Name ={
    name:Inputs
}



export default function EditRecruiterName({ name}:Name) {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const { mutate } = useSWRConfig();
  const open = useSelector((state: RootState) => state.recruiterModal.openName);
  const user = useSelector((state: RootState) => state.session);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors},
    reset,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await setLoading(true)
      await axios
        .patch(`${baseUrl}/recruiters/name/${user.id}`, data, {
          headers: { Authorization: "Bearer " + user.access_token },
        })
        .then((res) => {
        }).catch(async err=>{
          if(err.request.status === 401){
            await axios.post(`${baseUrl}/recruiters/refresh`,{refresh_token:user.refresh_token})
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
        `${baseUrl}/recruiters/${user.id}`,
        user.access_token,
        user.refresh_token,
      ]);
      await dispatch(setCloseName())
      await setLoading(false)
  };
  
  useEffect(()=>{
    reset({
        firstName:name.firstName,
        lastName:name.lastName,
        companyName:name.companyName,
    })
  },[open])

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setCloseName())}
      className={styles.container}
    >
      <DialogTitle>recruiter details</DialogTitle>
      <DialogContent className={styles.content}>
        <DialogContentText>
         Are you sure you want to edit?
        </DialogContentText>
        <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="fist name"
          type="text"
          size="small"
          defaultValue={name.firstName}
          {...register("firstName", { required: true })}
        />
        {errors.firstName && (
          <span style={{ color: "red", width: "100%" }}>
            This field is required
          </span>
        )}
         <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="last name"
          type="text"
          size="small"
          defaultValue={name.lastName}
          {...register("lastName", { required: true })}
        />
        {errors.lastName && (
          <span style={{ color: "red", width: "100%" }}>
            This field is required
          </span>
        )}
         <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="companyName"
          type="text"
          size="small"
          defaultValue={name.companyName}
          {...register("companyName")}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            dispatch(setCloseName());
          }}
          className={styles.btn}
          color="success"
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} className={styles.btn}>
        {
            loading?<CircularProgress size="20px" />:"update"
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}