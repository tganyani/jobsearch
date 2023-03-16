import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import styles from "../styles/Login.module.scss";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/router";

import { useDispatch, useSelector } from "react-redux";
import { setSession } from "@/store/slice/sessionSlice";
import { RootState } from "@/store/store";
import { baseUrl } from "@/baseUrl";
import { io } from "socket.io-client";
import Cookies from 'js-cookie'

const socket = io(`${baseUrl}`);

type Inputs = {
  email: string;
  password: string;
};

export default function Login() {
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
    await axios.post(`${baseUrl}/${accountType}s/login`, data).then((res) => {
      console.log(res.data);
      if (res.data.logged) {
        Cookies.set('user',res.data.email ) //setting the cookie
        Cookies.set('accountType',accountType )
        dispatch(
          setSession({
            email: res.data.email,
            access_token: res.data.access_token,
            id: res.data.id,
            position:res.data.position
          })
        );
        socket.emit("online", { id: res.data.id, accountType });
        router.push("/");
      }
      if (!res.data.logged) {
        setErrorMsg(res.data.message);
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.sub}>
        <h5 style={{ textAlign: "center" }}>logging as a {accountType}</h5>
        <p style={{ color: "red" }}>{errorMsg}</p>
        <TextField
          type="text"
          id="standard-basic"
          label="email"
          size="small"
          {...register("email", { required: true })}
        />
        {errors.email && (
          <span style={{ color: "red" }}>This field is required</span>
        )}
        <TextField
          id="standard-basic"
          label="password"
          size="small"
          type="password"
          {...register("password", { required: true })}
        />
        {errors.password && (
          <span style={{ color: "red" }}>This field is required</span>
        )}
        <Button
          variant="contained"
          style={{ height: "40px", textTransform: "lowercase" }}
          onClick={handleSubmit(onSubmit)}
        >
          login
        </Button>
        <p>
          Don't have account?
          <Button
            style={{ height: "40px", textTransform: "lowercase" }}
            onClick={() => router.push("/auth/signup")}
          >
            sign up
          </Button>
        </p>
      </div>
    </div>
  );
}
