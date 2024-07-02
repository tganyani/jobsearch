import { useSWRConfig } from "swr";
import styles from "../styles/Modal.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setCloseEdu } from "@/store/slice/modalSlice";
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
import dayjs from "dayjs";
import axios from "axios";
import { baseUrl } from "@/baseUrl";
import { useEffect, useState } from "react";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import { useRouter } from "next/router";
import CircularProgress from "@mui/material/CircularProgress";

type Inputs = {
  schoolName: string;
  startDate: string;
  endDate: string;
};

export type Edu = Inputs & { id: number };
type Props = {
  edu: Edu;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
};

export default function EditEdu({ edu, editMode, setEditMode }: Props) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const open = useSelector((state: RootState) => state.modal.openEdu);
  const user = useSelector((state: RootState) => state.session);
  const [loading, setLoading] = useState<boolean>(false);
  const [loading1, setLoading1] = useState<boolean>(false);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitSuccessful },
    reset,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (editMode) {
      setLoading1(true);
      await axios
        .patch(`${baseUrl}/candidates/edu/${edu?.id}`, data, {
          headers: { Authorization: "Bearer " + user.access_token },
        })
        .then((res) => {
          // console.log(res.data);
          setLoading1(false);
        })
        .catch(async (err) => {
          if (err.request.status === 401) {
            await axios
              .post(`${baseUrl}/candidates/refresh`, {
                refresh_token: user.refresh_token,
              })
              .then((res) => {
                dispatch(
                  setSession({ ...user, access_token: res.data.access_token })
                );
                if (!res.data.valid_access_token) {
                  dispatch(removeSession());
                  router.push("/aut/signin");
                }
              });
          }
        });
    } else {
      setLoading1(true);
      await axios
        .post(
          `${baseUrl}/candidates/edu`,
          { ...data, candidateId: user.id },
          {
            headers: { Authorization: "Bearer " + user.access_token },
          }
        )
        .then((res) => {
          setLoading1(false);
        })
        .catch(async (err) => {
          if (err.request.status === 401) {
            await axios
              .post(`${baseUrl}/candidates/refresh`, {
                refresh_token: user.refresh_token,
              })
              .then((res) => {
                dispatch(
                  setSession({ ...user, access_token: res.data.access_token })
                );
                if (!res.data.valid_access_token) {
                  dispatch(removeSession());
                  router.push("/aut/signin");
                }
              });
          }
        });
    }
    await dispatch(setCloseEdu());
    await mutate([
      `${baseUrl}/candidates/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  await setEditMode(false)
  };
  const handleDeleteEducation = async () => {
    await setLoading(true);
    await axios
      .delete(`${baseUrl}/candidates/edu/${edu?.id}`, {
        headers: { Authorization: "Bearer " + user.access_token },
      })
      .then((res) => {
        // console.log(res.data);
        setLoading(false);
      })
      .catch(async (err) => {
        if (err.request.status === 401) {
          await axios
            .post(`${baseUrl}/candidates/refresh`, {
              refresh_token: user.refresh_token,
            })
            .then((res) => {
              dispatch(
                setSession({ ...user, access_token: res.data.access_token })
              );
              if (!res.data.valid_access_token) {
                dispatch(removeSession());
                router.push("/aut/signin");
              }
            });
        }
      });
    await dispatch(setCloseEdu());
    await mutate([
      `${baseUrl}/candidates/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
    await setEditMode(false)
  };
  useEffect(() => {
    const Reset = () => {
      if (!editMode) {
        reset({
          schoolName: "",
          startDate: "",
          endDate: "",
        });
      } else {
        reset({
          schoolName: edu?.schoolName,
          startDate: edu?.startDate,
          endDate: edu?.endDate,
        });
      }
    };
    Reset();
  }, [open]);
  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setCloseEdu())}
      className={styles.container}
    >
      <DialogTitle>Education</DialogTitle>
      <DialogContent className={styles.content}>
        <DialogContentText>
          {" "}
          {editMode ? "Are you sure you want to edit?" : "Post new educa"}
        </DialogContentText>
        <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          label="school name"
          type="text"
          size="small"
          sx={{ width: "100%" }}
          {...register("schoolName", { required: true })}
          defaultValue={editMode ? edu?.schoolName : ""}
        />
        {errors.schoolName && (
          <span style={{ color: "red", width: "100%" }}>
            This field is required
          </span>
        )}
        <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          label="start date"
          type="date"
          size="small"
          sx={{ width: "100%" }}
          InputLabelProps={{
            shrink: true,
          }}
          {...register("startDate", { required: true })}
          defaultValue={
            editMode ? dayjs(edu?.startDate).format("YYYY-MM-DD") : ""
          }
        />
        {errors.startDate && (
          <span style={{ color: "red", width: "100%" }}>
            This field is required
          </span>
        )}
        <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          label="end date"
          type="date"
          size="small"
          sx={{ width: "100%" }}
          InputLabelProps={{
            shrink: true,
          }}
          {...register("endDate", { required: true })}
          defaultValue={
            editMode ? dayjs(edu?.endDate).format("YYYY-MM-DD") : ""
          }
        />
        {errors.endDate && (
          <span style={{ color: "red", width: "100%" }}>
            This field is required
          </span>
        )}
      </DialogContent>
      <DialogActions>
        {editMode && (
          <Button
            color="error"
            onClick={handleDeleteEducation}
            className={styles.btn}
          >
            {loading ? (
              <CircularProgress color="error" size="20px" />
            ) : (
              "delete"
            )}
          </Button>
        )}
        <Button
          onClick={() => {
            dispatch(setCloseEdu());
            setEditMode(false);
          }}
          className={styles.btn}
          color="success"
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} className={styles.btn}>
          {loading1 ? (
            <CircularProgress color="primary" size="20px" />
          ) :( editMode ? (
            "update"
          ) : (
            "add"
          ))}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
