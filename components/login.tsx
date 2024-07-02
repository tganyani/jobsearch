import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import styles from "../styles/Login.module.scss";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/router";
import { Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import LockIcon from '@mui/icons-material/Lock';

import { useDispatch, useSelector } from "react-redux";
import { setSession } from "@/store/slice/sessionSlice";
import { RootState } from "@/store/store";
import { baseUrl } from "@/baseUrl";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { setAccountType } from "@/store/slice/accountSlice";

const socket = io(`${baseUrl}`);

type Inputs = {
  email: string;
  password: string;
};

export default function Login() {
  const [loading, setLoading] = useState<Boolean|any>(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const accountType = useSelector(
    (state: RootState) => state.account.accountType
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true)
    await axios.post(`${baseUrl}/${accountType}s/login`, data).then((res) => {
      console.log(res.data);
      if (res.data.logged) {
        Cookies.set("user", res.data.email); //setting the cookie
        Cookies.set("accountType", accountType);
        dispatch(
          setSession({
            email: res.data.email,
            access_token: res.data.access_token,
            id: res.data.id,
            position: res.data.position,
            city: res.data?.city,
            country: res.data?.country,
            refresh_token: res.data.refresh_token,
            firstName:res.data.firstName,
            lastName:res.data.lastName,
          })
        );
        socket.emit("online", { id: res.data.id, accountType });
        // redirecting depending on the account type
        if (accountType === "candidate") {
          router.push("/");
        } else {
          router.push("/recruiter/vaccancy/allVaccancies");
        }
      }
      if (!res.data.logged) {
        setErrorMsg(res.data.message);
      }
    });
    setLoading(false)
  };

  return (
    <div className={styles.container}>
      
      <div className={styles.sub}>
      <div className={styles.top1}>
        <LockIcon sx={{color:"limegreen"}}/>
      </div>
        <div className={styles.top}>
        <Typography component="div" variant="body2" style={{ textAlign: "center" }}>login as a {accountType}?</Typography>
        <Button
            style={{ height: "40px", textTransform: "lowercase",color:"limegreen" }}
            size="small"
            onClick={accountType==="candidate"?()=>dispatch(setAccountType("recruiter")):()=>dispatch(setAccountType("candidate"))}
          >
            {accountType==="candidate"?"recruiter":"candidate"}
          </Button>
        </div>
        <Typography component="span" variant="body2" style={{ color: "tomato" }}>
        {errorMsg}
        </Typography>
        <TextField
          type="text"
          id="standard-basic"
          label="email"
          size="small"
          {...register("email", { required: true })}
        />
        {errors.email && (
          <span style={{ color: "tomato" }}>This field is required</span>
        )}
        <TextField
          id="standard-basic"
          label="password"
          size="small"
          type="password"
          {...register("password", { required: true })}
        />
        {errors.password && (
          <span style={{ color: "tomato" }}>This field is required</span>
        )}
        <Button
          variant="contained"
          sx={{ height: "40px", textTransform: "lowercase",backgroundColor:"limegreen" ,boxShadow: 0,"&:hover":{backgroundColor:"limegreen"}}}
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading?<CircularProgress size="20px" sx={{color:"white"}}/>:"login"}
        </Button>
        <Typography component="div" variant="body2" >
          Don't have account?
          <Button
            sx={{ height: "40px", textTransform: "lowercase",color:"limegreen" }}
            onClick={() => router.push("/auth/signup")}
          >
            sign up
          </Button>
        </Typography>
      </div>
    </div>
  );
}
