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
import { setCloseContact } from "@/store/slice/modalSlice";
import { useRouter } from "next/router";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import CircularProgress from "@mui/material/CircularProgress";


type Inputs = {
    phone:string,
    linkedIn:string,
    website:string,
    telegram:string,
};

type Contant ={
    contacts:Inputs
}



export default function EditRecruiterContact({ contacts}: Contant) {
  const router = useRouter()
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState<boolean>(false)
  const open = useSelector((state: RootState) => state.recruiterModal.openContact);
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
        .patch(`${baseUrl}/recruiters/contacts/${user.id}`, data , {
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
      await dispatch(setCloseContact())
      await setLoading(false)
  };
  useEffect(()=>{
    reset({
        phone:contacts.phone,
        telegram:contacts.telegram,
        linkedIn:contacts.linkedIn,
        website:contacts.website
    })
  },[open])

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setCloseContact())}
      className={styles.container}
    >
      <DialogTitle>contacts</DialogTitle>
      <DialogContent className={styles.content}>
        <DialogContentText>
         Are you sure you want to edit?
        </DialogContentText>
        <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="website link"
          type="text"
          size="small"
          defaultValue={contacts.website}
          {...register("website")}
        />
         <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="telegram link"
          type="text"
          size="small"
          defaultValue={contacts.telegram}
          {...register("telegram")}
        />
         <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="linkedIn link"
          type="text"
          size="small"
          defaultValue={contacts.linkedIn}
          {...register("linkedIn")}
        />
         <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="phone"
          type="text"
          size="small"
          defaultValue={contacts.phone}
          {...register("phone")}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            dispatch(setCloseContact());
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