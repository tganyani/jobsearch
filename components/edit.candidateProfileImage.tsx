import { useState } from "react";
import styles from "../styles/Modal.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setCloseImage } from "@/store/slice/modalSlice";
import { setSession, removeSession } from "@/store/slice/sessionSlice";
import axios from "axios";
import { useSWRConfig } from "swr";
import {
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { RootState } from "@/store/store";
import { FileUploader } from "react-drag-drop-files";
import { baseUrl } from "@/baseUrl";
import { useRouter } from "next/router";
import CircularProgress from '@mui/material/CircularProgress';
type Props = { prevPath: string };

const fileTypes = ["JPG", "PNG"];
export default function EditCandidateProfileImage({ prevPath }: Props) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const open = useSelector((state: RootState) => state.modal.openImage);
  const user = useSelector((state: RootState) => state.session);
  const dispatch = useDispatch();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false)
  const [loading2, setLoading2] = useState<boolean>(false)
  const [filePreview, setFilePreview] = useState<string | any>("");
  const handleChange = (file: any) => {
    setFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleDeleteProfile = async ()=>{
    let formData = new FormData();
    await formData.append("prevPath", prevPath);
    await setLoading(true)
    await axios
      .patch(`${baseUrl}/candidates/removeimage/${user.id}`, formData, {
        headers: { Authorization: "Bearer " + user.access_token },
      })
      .then((res) => {setLoading(false)})
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
      await dispatch(setCloseImage());
      await mutate([
        `${baseUrl}/candidates/${user.id}`,
        user.access_token,
        user.refresh_token,
      ]);
  }

  const handleSubmit = async () => {
    let formData = new FormData();
    await formData.append("prevPath", prevPath);
    await formData.append("image", file);
    await setLoading2(true)
    await axios
      .patch(`${baseUrl}/candidates/image/${user.id}`, formData, {
        headers: { Authorization: "Bearer " + user.access_token },
      })
      .then((res) => {
        
        setFile(null)
        setFilePreview("")
        setLoading2(false)
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
    await dispatch(setCloseImage());
    await mutate([
      `${baseUrl}/candidates/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        dispatch(setCloseImage())
        setFile(null);
        setFilePreview("");
      }}
      className={styles.container}
    >
      <DialogTitle>edit profile</DialogTitle>
      <DialogContent className={styles.content}>
        <DialogContentText>Are you sure you want to edit?</DialogContentText>
        <FileUploader
          handleChange={handleChange}
          name="file"
          types={fileTypes}
        />
        {file ? (
          <img
            src={filePreview}
            alt=""
            style={{ width: "120px", height: "120px", borderRadius: "60px" }}
          />
        ) : (
          <img
            src={`${baseUrl}${prevPath}`}
            alt=""
            style={{ width: "120px", height: "120px", borderRadius: "60px" }}
          />
        )}
      </DialogContent>
      <DialogActions>
        {prevPath && !file && (
          <Button
            onClick={handleDeleteProfile}
            color="error"
            className={styles.btn}
          >
            {loading ? (
              <CircularProgress size="20px" color="error" />
            ) : (
              "delete"
            )}
          </Button>
        )}
        <Button
          onClick={() => {
            dispatch(setCloseImage());
            setFile(null);
            setFilePreview("");
          }}
          color="success"
          className={styles.btn}
        >
          Cancel
        </Button>
        {file && (
          <Button onClick={handleSubmit} className={styles.btn}>
            {loading2 ? (
              <CircularProgress size="20px" color="success" />
            ) : (
              "update"
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
