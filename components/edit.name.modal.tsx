import { useEffect, useState } from "react";
import styles from "../styles/Modal.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import { setCloseName } from "@/store/slice/modalSlice";
import {
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  TextField,
  Button
} from "@mui/material";
import { RootState } from "@/store/store";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { baseUrl } from "@/baseUrl";
import { useSWRConfig } from "swr";
import { useRouter } from "next/router";
import CircularProgress from '@mui/material/CircularProgress';


type Inputs = {
  country:string,
  city:string,
  position:string,
};

type Profile ={
  profile:Inputs
}

export default function EditName({profile}:Profile) {
  const router = useRouter()
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState<boolean>(false)
  const open = useSelector((state:RootState)=>state.modal.openName)
  const user = useSelector((state:RootState)=>state.session)
  const dispatch = useDispatch() 
  
  const {
    register,
    handleSubmit,
    formState: { errors},
    reset,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true)
      await axios
        .patch(`${baseUrl}/candidates/profile/${user.id}`, data, {
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
      await dispatch(setCloseName())
      await mutate([`${baseUrl}/candidates/${user.id}`,user.access_token,user.refresh_token])
  };
  useEffect(()=>{
    reset({
        country:profile.country,
        city:profile.city,
        position:profile.position,
    })
  },[open])

  return (
      <Dialog open={open} onClose={()=>dispatch(setCloseName())} className={styles.container}>
        <DialogTitle>edit name</DialogTitle>
        <DialogContent className={styles.content} >
          <DialogContentText >
            Are you sure you want to edit?
          </DialogContentText>
          <TextField
          className={styles.input}
            autoFocus
            margin="dense"
            id="name"
            label="position"
            type="text"
            size="small"
            defaultValue={profile.position}
          {...register("position")}
          />
          <TextField
          className={styles.input}
            autoFocus
            margin="dense"
            id="name"
            label="country"
            type="text"
            size="small"
            defaultValue={profile.country}
          {...register("country")}
          />
          <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="city"
          type="text"
          size="small"
          defaultValue={profile.city}
          {...register("city")}
        />
        </DialogContent>
        <DialogActions>
          <Button color="success" onClick={()=>dispatch(setCloseName())} className={styles.btn}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}className={styles.btn} >
          {
            loading?<CircularProgress color="primary" size="20px" />:"update"
          }
          </Button>
        </DialogActions>
      </Dialog>
  );
}
