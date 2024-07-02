import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import axios from "axios";

import { setAccountType } from "@/store/slice/accountSlice";

import styles from "../../styles/SignUp.module.scss";
import { useForm, SubmitHandler } from "react-hook-form";
import { TextField, Button, MenuItem, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { baseUrl } from "@/baseUrl";
import { io } from "socket.io-client";

interface Inputs {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountType: string;
}
const socket = io(`${baseUrl}`);

export default function SignUp() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [candidateExist, setCandidateExist] = useState<string>("");
  const [recruiterExist, setRecruiterExist] = useState<string>("");
  const [loading, setLoading] = useState<Boolean | any>(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    reset({
      password: "",
      confirmPassword: "",
    });
  }, []);
  const onSubmit: SubmitHandler<Inputs> = async ({
    firstName,
    lastName,
    email,
    accountType,
    password,
  }) => {
    setLoading(true);
    await axios
      .post(`${baseUrl}/${accountType}s`, {
        firstName,
        lastName,
        email,
        password,
      })
      .then((res) => {
        if (res.data.account) {
          dispatch(setAccountType(accountType));
          router.push("/auth/signin");
          const admin =
            accountType === "candidate"
              ? "user1@gmail.com"
              : "employer1@gmail.com";
          const roomName =
            email < admin ? "".concat(email, admin) : "".concat(admin, email);
          socket.emit("createRoom", {
            candidateId: accountType === "candidate" ? res.data.userId : 1,
            recruiterId: accountType === "candidate" ? 1 : res.data.userId,
            name: roomName,
            message: `Hello ${firstName} ${lastName}! welcome to Imisebenzi . Its a platform you can post or apply for jobs` ,
            accountType:accountType === "candidate"?"recruiter":"candidate",
          });
        }
      })
      .catch((err) => console.log(err));
    setLoading(false);
  };
  useEffect(()=>{
    reset({
      email:" "
    })
  },[])
  useEffect(() => {
    const checkUser = async () => {
      await axios
        .post(`${baseUrl}/recruiters/email`, { email: watch("email") })
        .then((res) => {
          if (res.data.found) {
            setRecruiterExist("Oops! email already taken in recruiters");
          } else {
            setRecruiterExist("");
          }
        });
      await axios
        .post(`${baseUrl}/candidates/email`, { email: watch("email") })
        .then((res) => {
          if (res.data.found) {
            setCandidateExist("Oops! email already taken in candidates");
          } else {
            setCandidateExist("");
          }
        });
    };
    checkUser();
  }, [watch("email")]);
  const inputStyle = {
    // Root class for the input field
    "& .MuiOutlinedInput-root": {
      // fontFamily: "Arial",
      // Class for the border around the input field
      "& .MuiOutlinedInput-notchedOutline": {
        // borderWidth: "2px",
        borderColor: watch("password") === "" ? "primary" : "limegreen",
      },
      "&.Mui-focused": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: watch("password") === "" ? "primary" : "limegreen",
        },
      },
      "&:hover:not(.Mui-focused)": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: watch("password") === "" ? "primary" : "limegreen",
        },
      },
    },
    // Class for the label of the input field
    "& .MuiInputLabel-outlined": {
      "&.Mui-focused": {
        color: watch("password") === "" ? "primary" : "limegreen",
      },
    },
  };
  const inputStyle2 = {
    // Root class for the input field
    "& .MuiOutlinedInput-root": {
      // fontFamily: "Arial",
      borderColor: "tomato",
      // Class for the border around the input field
      "& .MuiOutlinedInput-notchedOutline": {
        // borderWidth: "2px",
        borderColor: "tomato",
      },
      "&.Mui-focused": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "tomato",
        },
      },
      "&:hover:not(.Mui-focused)": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "tomato",
        },
      },
    },
    // Class for the label of the input field
    "& .MuiInputLabel-outlined": {
      "&.Mui-focused": {
        color: "tomato",
      },
    },
  };
  return (
    <div className={styles.container}>
      <div className={styles.sub}>
        <div className={styles.top1}>
          <PersonAddAltIcon sx={{ color: "limegreen" }} />
        </div>
        <p style={{ color: "tomato", textAlign: "center" }}>{candidateExist}</p>
        <p style={{ color: "tomato", textAlign: "center" }}>{recruiterExist}</p>
        <TextField
          className={styles.text}
          type="text"
          id="standard-basic"
          label="first name"
          size="small"
          {...register("firstName", { required: true })}
        />
        {errors.firstName && (
          <span style={{ color: "tomato" }}>This field is required</span>
        )}
        <TextField
          className={styles.text}
          type="text"
          id="standard-basic"
          label="last name"
          size="small"
          {...register("lastName", { required: true })}
        />
        {errors.lastName && (
          <span style={{ color: "tomato" }}>This field is required</span>
        )}
        <TextField
          className={styles.text}
          type="email"
          id="standard-basic"
          label="email"
          size="small"
          {...register("email", { required: true })}
        />
        {errors.email && (
          <span style={{ color: "tomato" }}>This field is required</span>
        )}
        <TextField
          className={styles.text}
          type="password"
          id="standard-basic"
          label="password"
          size="small"
          defaultValue=""
          {...register("password", { required: true })}
        />
        {errors.password && (
          <span style={{ color: "tomato" }}>This field is required</span>
        )}
        <TextField
          className={styles.text}
          type="password"
          id="standard-basic"
          label="confirm password"
          size="small"
          {...register("confirmPassword", { required: true })}
          // error={watch("password") !== watch("confirmPassword")}
          sx={
            watch("password") !== watch("confirmPassword")
              ? inputStyle2
              : inputStyle
          }
        />
        {errors.confirmPassword && (
          <span style={{ color: "tomato" }}>This field is required</span>
        )}
        <TextField
          className={styles.text}
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
          <span style={{ color: "tomato" }}>This field is required</span>
        )}
        <Button
          className={styles.text}
          variant="contained"
          sx={{
            height: "40px",
            textTransform: "lowercase",
            backgroundColor: "limegreen",
            boxShadow: 0,
            "&:hover": { backgroundColor: "limegreen" },
          }}
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size="20px" sx={{ color: "white" }} />
          ) : (
            "sign up"
          )}
        </Button>
        <Typography>
          {" "}
          Have an account?
          <Button
            style={{
              height: "40px",
              textTransform: "lowercase",
              color: "limegreen",
            }}
            onClick={() => router.push("/auth/signin")}
          >
            login
          </Button>
        </Typography>
      </div>
    </div>
  );
}
