import { useSWRConfig } from "swr";
import styles from "../styles/Modal.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setCloseProject } from "@/store/slice/modalSlice";
import {
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  FormControl,
} from "@mui/material";
import { RootState } from "@/store/store";
import { useForm, SubmitHandler, set } from "react-hook-form";
import axios from "axios";
import { baseUrl } from "@/baseUrl";
import { useEffect, useState } from "react";
import { removeSession, setSession } from "@/store/slice/sessionSlice";
import { useRouter } from "next/router";
import ClearIcon from "@mui/icons-material/Clear";
import CircularProgress from "@mui/material/CircularProgress";
import { v4 as uuidv4 } from "uuid";

type Inputs = {
  title: string;
  link: string;
  description: string;
};
type image = { id: number | string; url: string };

export type Proj = Inputs & { id: number; images: image[] };
type Props = {
  project: Proj;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
};

export default function EditProjects({
  project,
  editMode,
  setEditMode,
}: Props) {
  const router = useRouter();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loading1, setLoading1] = useState<boolean>(false);
  const [preViewFiles, setPreViewFiles] = useState<image[]|any[]>([]);
  const [initialImages, setInitialImages] = useState<image[]>([]);
  const [cancelMode, setCancelMode] = useState<boolean>(false);
  const { mutate } = useSWRConfig();
  const open = useSelector((state: RootState) => state.modal.openProject);
  const user = useSelector((state: RootState) => state.session);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<Inputs>();
  // handle upload of multiple files
  const handleMultipleChange = (event: any) => {
    if (event.target.files) {
      setFiles([...event.target.files]);
    }
  };
  const handleCancelImage = async (id: string | number,removedName:string|any="") => {
    setCancelMode(true)
    setPreViewFiles(preViewFiles.filter((file) => file.id !== id));
    setInitialImages(initialImages.filter((file) => file.id !== id));
    setFiles(files.filter((file) => file.name !== removedName))
    setTimeout(()=>setCancelMode(false),1000)
  };

  const handleDeleteProject = async () => {
    await setLoading1(true);
    await axios
      .delete(`${baseUrl}/candidates/projects/${project.id}`, {
        headers: {
          Authorization: "Bearer " + user.access_token,
        },
      })
      .then((res) => {
        // console.log(res.data);
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
    await setLoading1(false);
    await dispatch(setCloseProject());
    await setEditMode(false);
    await mutate([
      `${baseUrl}/candidates/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  };

  const handleSubmit2 = async () => {
    const formData = new FormData();
    await formData.append("title", watch("title"));
    await formData.append("link", watch("link"));
    await formData.append("description", watch("description"));
    await formData.append("len", `${initialImages.length}`);
    await files.forEach((file, index) => {
      formData.append(`projects`, file);
    });
    await setLoading(true);
    if (editMode) {
      await initialImages.forEach((Im, index) => {
        formData.append("initialImages", Im.url);
      });
      await axios
        .patch(`${baseUrl}/candidates/projects/${project.id}`, formData, {
          headers: {
            Authorization: "Bearer " + user.access_token,
          },
        })
        .then((res) => {
          // console.log(res.data);
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
    } else {
      await formData.append("candidateId", `${user.id}`);
      await axios
        .post(`${baseUrl}/candidates/projects`, formData, {
          headers: { Authorization: "Bearer " + user.access_token },
        })
        .then((res) => {
          console.log(res.data);
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
    await setLoading(false);
    await dispatch(setCloseProject());
    await setFiles([]);
    await setPreViewFiles([])
    await setEditMode(false);
    await mutate([
      `${baseUrl}/candidates/${user.id}`,
      user.access_token,
      user.refresh_token,
    ]);
  };
  useEffect(() => {
    const loadInialImages = () => {
      if (project?.images[0]) {
        setInitialImages(project?.images);
      }
    };
    loadInialImages();
  }, [open]);
  useEffect(() => {
    const Reset = () => {
      if (!editMode) {
        reset({
          title: "",
          link: "",
          description: "",
        });
      } else {
        reset({
          title: project.title,
          link: project.link,
          description: project.description,
        });
      }
    };
    Reset();
    const preView = ()=>{
      if(editMode){
        setPreViewFiles(
          project?.images?.map((file: image) => ({
            ...file,
            url: `${baseUrl}${file.url}`,
          }))
        );
      }
      else{
        setPreViewFiles([])
      }
    }
    preView()
  }, [open]);
  useEffect(() => {
    const filePreView = () => {
      if(!cancelMode){
        const tempUploads = files.map((file: any) => ({
          id: uuidv4(),
          url: URL.createObjectURL(file),
          name:file.name
        }));
        editMode
          ? setPreViewFiles([...preViewFiles, ...tempUploads])
          : setPreViewFiles([...tempUploads]);
      }
    };
    filePreView();
  }, [files]);


  return (
    <Dialog
      open={open}
      onClose={() => {
        dispatch(setCloseProject())
        setEditMode(false)
        setPreViewFiles([])
      }}
      className={styles.container}
    >
      <DialogTitle>Project</DialogTitle>
      <DialogContent className={styles.content}>
        <DialogContentText>
          {" "}
          {editMode ? "Are you sure you want to edit?" : "Post new project"}
        </DialogContentText>
        <FormControl>
          <TextField
            fullWidth
            autoFocus
            margin="dense"
            id="name"
            label="title"
            type="text"
            size="small"
            {...register("title", { required: true })}
            defaultValue={editMode ? project.title : ""}
          />
          {errors.title && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
          <TextField
            fullWidth
            autoFocus
            margin="dense"
            id="name"
            label="description"
            type="text"
            multiline
            minRows={4}
            {...register("description", { required: true })}
            defaultValue={editMode ? project.title : ""}
          />
          {errors.description && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexFlow: "row wrap",
              justifyContent: "space-around",
              gap: "10px",
            }}
          >
            {preViewFiles &&
              preViewFiles?.map((file) => (
                <div style={{ position: "relative" }} key={file.id}>
                  <div
                    className={styles.imageCancel}
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "-10px",
                      border: "2px solid white",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <ClearIcon
                        style={{ fontSize: "20px", color: "white" }}
                        onClick={() => handleCancelImage(file.id,file.name?file.name:"")}
                      />
                    </div>
                  </div>
                  <img
                    // src={URL.createObjectURL(file)}
                    src={file.url}
                    alt="image"
                    style={{
                      width: "120px",
                      height: "120px",
                    }}
                  />
                </div>
              ))}
          </div>
          <TextField
            fullWidth
            focused
            margin="dense"
            id="images"
            label="project images"
            type="file"
            inputProps={{
              multiple: true,
            }}
            onChange={handleMultipleChange}
          />
          <TextField
            fullWidth
            autoFocus
            margin="dense"
            id="name"
            label="link"
            type="text"
            size="small"
            {...register("link", { required: true })}
            defaultValue={editMode ? project.link : ""}
          />
          {errors.link && (
            <span style={{ color: "red", width: "100%" }}>
              This field is required
            </span>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        {editMode && (
          <Button
            onClick={handleDeleteProject}
            className={styles.btn}
            color="error"
          >
            {loading1 ? (
              <CircularProgress color="error" size="20px" />
            ) : (
              "delete"
            )}
          </Button>
        )}
        <Button
          onClick={() => {
            dispatch(setCloseProject());
            setEditMode(false);
            setFiles([]);
            setPreViewFiles([])
          }}
          className={styles.btn}
          color="success"
        >
          Cancel
        </Button>
        <Button onClick={() => handleSubmit2()} className={styles.btn}>
          {loading ? (
            <CircularProgress color="primary" size="20px" />
          ) : editMode ? (
            "update"
          ) : (
            "add"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
