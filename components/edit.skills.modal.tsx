import { useSWRConfig } from "swr";
import styles from "../styles/Modal.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setCloseSkill } from "@/store/slice/modalSlice";
import ClearIcon from '@mui/icons-material/Clear';
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
import { removeSession, setSession } from "@/store/slice/sessionSlice";
import { useRouter } from "next/router";
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";


interface Inputs {
    experience: number;
    title: string;
}

interface SKill extends Inputs {
    id:number
}

interface Props {
    skills:SKill[];
}

export default function EditSkill({skills}:Props) {
  const router = useRouter()
  const { mutate } = useSWRConfig();
  const [loading,setLoading] = useState<boolean>(false)
  const [loading1,setLoading1] = useState<boolean>(false)
  const [targetId, setTargetId] = useState<number|null>(null)
  const open = useSelector((state:RootState)=>state.modal.openSkill)
  const user = useSelector((state:RootState)=>state.session)
  const dispatch = useDispatch()  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors},
    reset,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await setLoading(true)
      await axios
        .post(`${baseUrl}/candidates/skills`,{ ...data, candidateId: user.id }, {
          headers: { Authorization: "Bearer " + user.access_token },
        })
        .then((res) => {
          // console.log(res.data);
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
      await mutate([`${baseUrl}/candidates/${user.id}`,user.access_token,user.refresh_token])
     
  };
  const handleCancel = async(idToDelete:number)=>{
    await setTargetId(idToDelete)
    await setLoading1(true)
     await axios
        .delete(`${baseUrl}/candidates/skills/${idToDelete}`, {
          headers: { Authorization: "Bearer " + user.access_token },
        })
        .then((res) => {
          // console.log(res.data);
          
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
      await mutate([`${baseUrl}/candidates/${user.id}`,user.access_token,user.refresh_token])
      setLoading1(false)
      setTargetId(null)
  }
  return (
      <Dialog open={open} onClose={()=>dispatch(setCloseSkill())} className={styles.container}>
        <DialogTitle>edit skill</DialogTitle>
        <DialogContent className={styles.content} >
          <DialogContentText >
            Are you sure you want to edit?
          </DialogContentText>
          <div className={styles.sub}>
            {
                skills.map((item:SKill)=>(
                    <div key={item.id} className={styles.inner}>
                        <p>{item.title}</p>
                        {
                          (targetId!==item.id)&&<ClearIcon  className={styles.cancel} onClick={()=>handleCancel(item.id)}/>
                          
                        }
                        {
                          (loading1&&targetId===item.id)&&<CircularProgress className={styles.cancelLoading}  color="error" size="20px" />
                        }
                    </div>
                ))
            }
          </div>
          <TextField
          className={styles.input}
            autoFocus
            margin="dense"
            id="name"
            label="title"
            type="text"
            size="small"
            {...register("title", { required: true })}
          />
           {errors.title && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
          <TextField
          className={styles.input}
            autoFocus
            margin="dense"
            id="name"
            label="experience"
            type="number"
            size="small"
            {...register("experience", { required: true })}
          />
          {errors.experience && (
          <span style={{ color: "red", width: "100%" }}>
            This field is required
          </span>
        )}
        </DialogContent>
        <DialogActions>
          <Button color="success" onClick={()=>dispatch(setCloseSkill())} className={styles.btn}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}className={styles.btn} >{loading?<CircularProgress color="primary" size="20px" />:"add"}</Button>
        </DialogActions>
      </Dialog>
  );
}
