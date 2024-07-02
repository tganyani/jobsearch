import { useSWRConfig } from "swr";
import styles from "../styles/Modal.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setClosePrevPos } from "@/store/slice/modalSlice";
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
  position: string;
  companyName: string;
  startDate: string;
  endDate: string;
};

export type Pos = Inputs & { id: number };
type Props = {
  pos: Pos;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
};

export default function EditPrevPositions({
  pos,
  editMode,
  setEditMode,
}: Props) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const open = useSelector((state: RootState) => state.modal.openPrevPos);
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
  const handleDeletePreviousPosition = async () => {
    setLoading(true);
    await axios
      .delete(`${baseUrl}/candidates/pos/${pos?.id}`, {
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
            .then(async (res) => {
              if (!res.data.valid_access_token) {
                dispatch(removeSession());
                router.push("/auth/signin");
              }
              await dispatch(
                setSession({ ...user, access_token: res.data.access_token })
              );
              setLoading(true);
              await axios
                .delete(`${baseUrl}/candidates/pos/${pos?.id}`, {
                  headers: { Authorization: "Bearer " + user.access_token },
                })
                .then((res) => {
                  // console.log(res.data);
                  setLoading(false);
                });
            });
        }
      });
    await dispatch(setClosePrevPos());
    await mutate([
      `${baseUrl}/candidates/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
    await setEditMode(false)
  };
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (editMode) {
      setLoading1(true);
      await axios
        .patch(`${baseUrl}/candidates/pos/${pos.id}`, data, {
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
              .then(async (res) => {
                if (!res.data.valid_access_token) {
                  dispatch(removeSession());
                  router.push("/auth/signin");
                }
                await dispatch(
                  setSession({ ...user, access_token: res.data.access_token })
                );
                setLoading1(true);
                await axios
                  .patch(`${baseUrl}/candidates/pos/${pos.id}`, data, {
                    headers: { Authorization: "Bearer " + user.access_token },
                  })
                  .then((res) => {
                    // console.log(res.data);
                    setLoading1(false);
                  });
              });
          }
        });
    } else {
      setLoading1(true);
      await axios
        .post(
          `${baseUrl}/candidates/pos`,
          { ...data, candidateId: user.id },
          {
            headers: { Authorization: "Bearer " + user.access_token },
          }
        )
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
                  router.push("/auth/signin");
                }
              });
          }
        });
    }
    await dispatch(setClosePrevPos());
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
          companyName: "",
          position: "",
          startDate: "",
          endDate: "",
        });
      } else {
        reset({
          position: pos?.position,
          companyName: pos?.companyName,
          startDate: pos?.startDate,
          endDate: pos?.endDate,
        });
      }
    };
    Reset();
  }, [open]);
  console.log(pos);
  return (
    <Dialog
      open={open}
      onClose={() => dispatch(setClosePrevPos())}
      className={styles.container}
    >
      <DialogTitle>Previous Positions</DialogTitle>
      <DialogContent className={styles.content}>
        <DialogContentText>
          {" "}
          {editMode ? "Are you sure you want to edit?" : "Post new previous position"}
        </DialogContentText>
        <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="company name"
          type="text"
          size="small"
          sx={{ width: "100%" }}
          {...register("companyName", { required: true })}
          defaultValue={editMode ? pos?.companyName : ""}
        />
        {errors.companyName && (
          <span style={{ color: "red", width: "100%" }}>
            This field is required
          </span>
        )}
        <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="postion"
          type="text"
          size="small"
          sx={{ width: "100%" }}
          {...register("position", { required: true })}
          defaultValue={editMode ? pos?.companyName : ""}
        />
        {errors.position && (
          <span style={{ color: "red", width: "100%" }}>
            This field is required
          </span>
        )}
        <TextField
          className={styles.input}
          autoFocus
          margin="dense"
          id="name"
          label="start date"
          type="date"
          size="small"
          sx={{ width: "100%" }}
          InputLabelProps={{
            shrink: true,
          }}
          {...register("startDate", { required: true })}
          defaultValue={
            editMode ? dayjs(pos?.startDate).format("YYYY-MM-DD") : ""
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
          id="name"
          label="end date"
          type="date"
          size="small"
          sx={{ width: "100%" }}
          InputLabelProps={{
            shrink: true,
          }}
          {...register("endDate", { required: true })}
          defaultValue={
            editMode ? dayjs(pos?.endDate).format("YYYY-MM-DD") : ""
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
            onClick={handleDeletePreviousPosition}
            className={styles.btn}
            color="error"
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
            dispatch(setClosePrevPos());
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
          ) : (editMode ? (
            "update"
          ) : (
            "add"
          ))}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
