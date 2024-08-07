import { useState } from "react";
import { useSWRConfig } from "swr";
import styles from "../../styles/Modal.module.scss";
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
import { useEffect } from "react";
import { setCloseAddress } from "@/store/slice/recruiterModalSlice";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import { useRouter } from "next/router";
import CircularProgress from "@mui/material/CircularProgress";

type Inputs = {
    country:string,
    city:string,
    street:string,
};

type Address ={
    address:Inputs
}



export default function EditRecruiterAddress({ address}: Address) {
  const router = useRouter()
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState<boolean>(false)
  const open = useSelector((state: RootState) => state.recruiterModal.openAddress);
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
        .patch(`${baseUrl}/recruiters/address/${user.id}`, data, {
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
      await dispatch(setCloseAddress())
      await setLoading(false)
  };
  useEffect(()=>{
    reset({
        country:address.country,
        city:address.city,
        street:address.street,
    })
  },[open])

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setCloseAddress())}
      className={styles.container}
    >
      <DialogTitle>address</DialogTitle>
      <DialogContent className={styles.content}>
        <DialogContentText>
         Are you sure you want to edit?
        </DialogContentText>
        <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="country"
          type="text"
          size="small"
          defaultValue={address.country}
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
          defaultValue={address.city}
          {...register("city")}
        />
         <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="street"
          type="text"
          size="small"
          defaultValue={address.street}
          {...register("street")}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            dispatch(setCloseAddress());
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