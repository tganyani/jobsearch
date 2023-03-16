import {useEffect, useState} from 'react'
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import axios from 'axios';

import { setAccountType } from '@/store/slice/accountSlice';

import styles from "../../styles/SignUp.module.scss";
import { useForm, SubmitHandler } from "react-hook-form";
import { TextField, Button, MenuItem } from "@mui/material";
import { baseUrl } from '@/baseUrl';

interface Inputs {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountType: string;
}

export default function SignUp() {
  const dispatch = useDispatch()
  const router = useRouter()
  const [candidateExist, setCandidateExist] = useState<string>("")
  const [recruiterExist, setRecruiterExist] = useState<string>("")
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async ({firstName,lastName,email,accountType,password}) => {
    await axios.post(`${baseUrl}/${accountType}s`,{firstName,lastName,email,password})
    .then(res=>{
      if(res.data.account){
        dispatch(setAccountType(accountType))
        router.push('/auth/signin')
      }
    }).catch(err=>console.log(err))
  }
  useEffect(()=>{
    const checkUser = async()=>{
        await axios.post(`${baseUrl}/recruiters/email`,{email:watch('email')})
        .then(res=>{
            if(res.data.found){
              setRecruiterExist("Oops! email already taken in recruiters")
            }
            else{
                setRecruiterExist("")
            }
        })
        await axios.post(`${baseUrl}/candidates/email`,{email:watch('email')})
        .then(res=>{
            if(res.data.found){
                setCandidateExist("Oops! email already taken in candidates")
            }
            else{
              setCandidateExist("")
            }
        })
    }
    checkUser()
  },[watch("email")])
  return (
    <div className={styles.container}>
      <div className={styles.sub}>
        <p style={{color:"red", textAlign:"center"}}>{candidateExist}</p>
        <p style={{color:"red", textAlign:"center"}}>{recruiterExist}</p>
        <TextField
          type="text"
          id="standard-basic"
          label="first name"
          size="small"
          {...register("firstName", { required: true })}
        />
        {errors.firstName && (
          <span style={{ color: "red" }}>This field is required</span>
        )}
        <TextField
          type="text"
          id="standard-basic"
          label="last name"
          size="small"
          {...register("lastName", { required: true })}
        />
        {errors.lastName && (
          <span style={{ color: "red" }}>This field is required</span>
        )}
        <TextField
          type="email"
          id="standard-basic"
          label="email"
          size="small"
          {...register("email", { required: true })}
        />
        {errors.email && (
          <span style={{ color: "red" }}>This field is required</span>
        )}
        <TextField
          type="password"
          id="standard-basic"
          label="password"
          size="small"
          defaultValue=""
          {...register("password", { required: true })}
        />
        {errors.password && (
          <span style={{ color: "red" }}>This field is required</span>
        )}
        <TextField
          type="password"
          id="standard-basic"
          label="confirm password"
          size="small"
          {...register("confirmPassword", { required: true })}
          
          error={watch("password") !== watch("confirmPassword")}
        />
        {errors.confirmPassword && (
          <span style={{ color: "red" }}>This field is required</span>
        )}
        <TextField
          type="text"
          select
          id="standard-basic"
          label="account type"
          size="small"
          {...register("accountType", { required: true })}
        >
          <MenuItem value="candidate">candidate </MenuItem>
          <MenuItem value="recruiter">recruiter </MenuItem>
        </TextField>
        {errors.accountType && (
          <span style={{ color: "red" }}>This field is required</span>
        )}
        <Button
          variant="contained"
          style={{ height: "40px", textTransform: "lowercase" }}
          onClick={handleSubmit(onSubmit)}
        >
          sign up
        </Button>
        <p>
          Have an account?
          <Button
            style={{ height: "40px", textTransform: "lowercase" }}
            onClick={() => router.push("/auth/signin")}
          >
            login
          </Button>
        </p>
      </div>
    </div>
  );
}
