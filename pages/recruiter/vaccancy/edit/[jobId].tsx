import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import useSWR from "swr";
import styles from "@/styles/Vaccancy.module.scss";
import { TextField, MenuItem, Button } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import { baseUrl } from "@/baseUrl";
import { io } from "socket.io-client";

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
};

interface Skill {
  id: string;
  title: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EditVaccancy() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skill, setSkill] = useState<string>("");
  const vaccancyId = router.query.jobId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const { data, error } = useSWR(
    `${baseUrl}/vaccancy/${vaccancyId}`,
    fetcher
  );

  useEffect(()=>{
    reset({
        city: data?.city,
        companyName: data?.companyName,
        country: data?.country,
        companyWebsite: data?.companyWebsite,
        title: data?.title,
        description: data?.description,
        condition: data?.condition,
        salary: data?.salary,
    })
    setSkills(data?.skills?.data)
  },[data])

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const submitData = {
      ...data,
      skills: {
        data: skills,
      },
    };
    await axios.patch(`${baseUrl}/vaccancy/${vaccancyId}`, submitData).then((res) => {
    //   alert(res.data?.message);
    });
    await socket.emit("newJob");
    await socket.emit("newJobUpdate")
    await router.push(`/recruiter/vaccancy/preview/${vaccancyId}`)
  };
 
  const handleChangeSKillInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkill(e.target.value);
  };
  const handleClickAddBtnm = () => {
    setSkills([...skills, { id: uuidv4(), title: skill }]);
  };

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <p>Edit <span style={{fontWeight:"600"}}>{data?.title}</span> vaccancy</p>
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
            {skills?.map((item: Skill) => (
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
            >
              add
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
          <Button
            variant="contained"
            className={styles.text}
            type="submit"
            sx={{
              fontWeight: "300",
              boxShadow: 0,
              textTransform: "lowercase",
            }}
          >
            update 
          </Button>
        </div>
      </form>
    </div>
  );
}
