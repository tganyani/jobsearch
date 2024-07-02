import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import styles from "../../../styles/Vaccancy.module.scss";
import { TextField, MenuItem, Button } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import ClearIcon from "@mui/icons-material/Clear";
import Alert from "@mui/material/Alert";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import { baseUrl } from "@/baseUrl";
import { io } from "socket.io-client";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import { useRouter } from "next/router";
import { Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";



const socket = io(`${baseUrl}`);

type Inputs = {
  city: string;
  companyName: string;
  country: string;
  companyWebsite: string;
  title: string;
  description: string;
  condition: string;
  salary: number;
  field: string;
};

interface Skill {
  id: string;
  title: string;
}

export const jobFields = [
  { id: 1, title: "general" },
  { id: 2, title: "arts" },
  { id: 3, title: "business" },
  { id: 4, title: "communications" },
  { id: 5, title: "education" },
  { id: 6, title: "health care" },
  { id: 7, title: "hospitality" },
  { id: 8, title: "information technology" },
  { id: 9, title: "law enforcement" },
  { id: 10, title: "sales and marketing" },
  { id: 11, title: "science" },
  { id: 12, title: "transportation" },
  { id: 13, title: "engineering" },
];

export default function Vaccancy() {
  const id = useSelector((state: RootState) => state.session.id);
  const [posted, setPosted] = useState<boolean>(false);
  const user = useSelector((state: RootState) => state.session);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const submitData = {
      ...data,
      recruiterId: id,
      skills: {
        data: skills,
      },
    };
    setLoading(true)
    await axios
      .post(`${baseUrl}/vaccancy`, submitData, {
        headers: { Authorization: "Bearer " + user.access_token },
      })
      .then((res) => {
        if (res.data.posted) {
          setPosted(true);
          setTimeout(() => {
            setPosted(false);
          }, 6000);
        }
      })
      .catch(async (err) => {
        if (err.request.status === 401) {
          await axios
            .post(`${baseUrl}/recruiters/refresh`, {
              refresh_token: user.refresh_token,
            })
            .then((res) => {
              dispatch(
                setSession({ ...user, access_token: res.data.access_token })
              );
              if (!res.data.valid_access_token) {
                dispatch(removeSession());
                router.push("/auth/signin");
              }
            });
        }
      });
      setLoading(false)
    await socket.emit("newJob");
  };
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skill, setSkill] = useState<string>("");
  const handleChangeSKillInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkill(e.target.value);
  };
  const handleClickAddBtnm = async () => {
    if(skill!==""){
      setSkills([...skills, { id: uuidv4(), title: skill }]);
      setSkill("");
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Typography component="div" variant="h6">
          Post a new job
        </Typography>
        {posted && (
          <Alert className={styles.alert} variant="filled" severity="success">
            Job successfully posted
          </Alert>
        )}
        <div className={styles.companyName}>
          <TextField
            className={styles.text}
            type="text"
            label="company name"
            size="small"
            {...register("companyName", { required: true })}
          />
          <TextField
            className={styles.text}
            type="text"
            size="small"
            style={{ width: "50%" }}
            label="city"
            {...register("city", { required: true })}
          />
        </div>
        <div className={styles.errors}>
          {errors.companyName && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
          {errors.city && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
        </div>
        <div className={styles.companyAddress}>
          <TextField
            className={styles.text}
            type="text"
            label="country located"
            size="small"
            {...register("country", { required: true })}
          />
          <TextField
            className={styles.text}
            type="text"
            label="company website"
            size="small"
            {...register("companyWebsite", { required: true })}
            defaultValue={`${user.firstName}`}
          />
        </div>
        <div className={styles.errors}>
          {errors.country && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
          {errors.companyWebsite && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
        </div>
        <div className={styles.title}>
          <TextField
            className={styles.text}
            type="text"
            label="job title"
            size="small"
            {...register("title", { required: true })}
          />
        </div>
        <div className={styles.errors}>
          {errors.title && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
        </div>
        <div className={styles.description}>
          <TextField
            className={styles.text}
            type="text"
            label="job description"
            size="small"
            multiline
            minRows={4}
            {...register("description", { required: true })}
          />
        </div>
       
        <div className={styles.errors}>
          {errors.description && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
        </div>
        <div className={styles.skills}>
          <div className={styles.inner}>
            {skills.map((item: Skill) => (
              <div className={styles.skill} key={item.id}>
                {item.title}
                <ClearIcon
                  className={styles.clear}
                  onClick={() =>
                    setSkills(skills.filter((it: Skill) => it.id !== item.id))
                  }
                />
              </div>
            ))}
          </div>
          <div className={styles.bottom}>
            <TextField
              className={styles.text}
              type="text"
              label="key skills"
              size="small"
              value={skill}
              onChange={handleChangeSKillInput}
            />
            <Button
              variant="contained"
              className={styles.text}
              onClick={handleClickAddBtnm}
              sx={{
                fontWeight: "300",
                boxShadow: 0,
                textTransform: "lowercase",
              }}
              disabled={skill===""}
            >
              add skill
            </Button>
          </div>
        </div>
        <div className={styles.workConditions}>
          <TextField
            className={styles.text}
            type="number"
            label="salary"
            size="small"
            {...register("salary", { required: true })}
          />
          <TextField
            className={styles.text}
            select
            type="text"
            label="work condition"
            size="small"
            defaultValue="office"
            sx={{ minWidth: 180 }}
            {...register("condition", { required: true })}
          >
            <MenuItem value="office">in office </MenuItem>
            <MenuItem value="remote">remote </MenuItem>
          </TextField>
        </div>
        <div className={styles.errors}>
          {errors.salary && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
          {errors.condition && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
        </div>
        <div className={styles.submitBtn}>
          <TextField
            className={styles.text}
            select
            type="text"
            label="job field or sector"
            size="small"
            // defaultValue="general"
            sx={{ minWidth: 180 }}
            {...register("field", { required: true })}
          >
            {jobFields.map((field: { id: number | any; title: string }) => (
              <MenuItem id={field.id} value={field.title}>
                {field.title}{" "}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            className={styles.text}
            type="submit"
            sx={{
              fontWeight: "300",
              boxShadow: 0,
              textTransform: "lowercase",
            }}
            disabled={loading}
          >
           
            {loading?<CircularProgress size="20px" sx={{color:"grey"}} />:" submit"}
          </Button>
        </div>
        <div className={styles.errors}>
          {errors.field && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
