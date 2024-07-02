import { useSWRConfig } from "swr";
import styles from "../../styles/Modal.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setCloseAbout } from "../../store/slice/recruiterModalSlice";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import CircularProgress from "@mui/material/CircularProgress";

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
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Inputs = {
  about: string;
};

export default function EditRecruiterAbout({ about }: Inputs) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false)
  const { mutate } = useSWRConfig();
  const open = useSelector(
    (state: RootState) => state.recruiterModal.openAbout
  );
  const user = useSelector((state: RootState) => state.session);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await setLoading(true)
    await axios
      .patch(`${baseUrl}/recruiters/about/${user.id}`, data, {
        headers: { Authorization: "Bearer " + user.access_token },
      })
      .then((res) => {})
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
    await mutate([
      `${baseUrl}/recruiters/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
    await dispatch(setCloseAbout());
    await setLoading(false)
  };
  useEffect(() => {
    reset({
      about,
    });
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setCloseAbout())}
      className={styles.container}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>about</DialogTitle>
      <DialogContent className={styles.content}>
        <DialogContentText>Are you sure you want to edit?</DialogContentText>
        <TextField
          sx={{ width: "100%" }}
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="about"
          type="text"
          size="small"
          multiline
          minRows={2}
          defaultValue={about}
          {...register("about")}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            dispatch(setCloseAbout());
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
