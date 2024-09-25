import {
    Avatar,
    Button,
    Container,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { VisuallyHiddenInput } from "../components/styles/StyledComponents";
import { CameraAlt as CameraAltIcon } from "@mui/icons-material"
import React, { useState } from 'react'
import { useInputValidation, useFileHandler } from "6pp"
import { usernameValidator } from "../utils/validators";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { server } from "../components/Constants/Config";
import { userExists } from "../redux/reducers/auth";

function Login() {
    const [isLogin, setisLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false);

    const name = useInputValidation("");
    const bio = useInputValidation("");
    const password = useInputValidation("");
    const username = useInputValidation("", usernameValidator);
    const toggleLogin = () => {
        setisLogin((prev) => !prev)
    }

    const avatar = useFileHandler("single");

    const dispatch = useDispatch();

    const handleLogin = async (e)=>{
        e.preventDefault(); 
        const toastId = toast.loading("Logging In...");

        setIsLoading(true);
    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/login`,
        {
          username: username.value,
          password: password.value,
        },
        config
      );
      dispatch(userExists(data.user));
      toast.success(data.message,{
        id: toastId,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something Went Wrong",{
        id: toastId,
      });
    }
    finally {
        setIsLoading(false);
      }
    }

    const handleSignIn = async(e)=>{
        e.preventDefault();
        const toastId = toast.loading("Signing Up...");
        setIsLoading(true);
    const formData = new FormData()
    formData.append("avatar", avatar.file);
    formData.append("name", name.value);
    formData.append("bio", bio.value);
    formData.append("username", username.value);
    formData.append("password", password.value);

    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/new`,
        formData,
        config
      );

      dispatch(userExists(data.user));
      toast.success(data.message,{
        id: toastId,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something Went Wrong",{
        id: toastId,
      });
    } finally {
        setIsLoading(false);
      }
  
  };

    
    return ( <div
        style={{
          backgroundImage: "linear-gradient(rgb(214 119 119), rgb(55 79 169)"

        }}
      >
        <Container
            component={"main"}
            maxWidth="xs"
            sx={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                {
                    isLogin ? (<>
                        <Typography variant='h5'> Login </Typography>
                        <form style={{
                            width: "100%",
                            marginTop: "1rem",
                        }} onSubmit={handleLogin}>
                            <TextField required
                                fullWidth
                                label="Username"
                                placeholder="username"
                                margin="normal"
                                variant="outlined"
                                value={username.value}
                                onChange={username.changeHandler}
                            />
                            <TextField required
                                fullWidth
                                label="Password"
                                type="password"
                                margin="normal"
                                variant="outlined"
                                value={password.value}
                                onChange={password.changeHandler} />
                            <Button
                                sx={{
                                    marginTop: "1rem",
                                }}
                                variant="contained"
                                color="primary"
                                type="submit"
                                fullWidth
                                disabled={isLoading}

                            >
                                Login
                            </Button>
                            <Typography textAlign={"center"} m={"1rem"}>
                                OR
                            </Typography>
                            <Button
                                fullWidth
                                variant="text"
                                onClick={toggleLogin}
                                disabled={isLoading}
                            >
                                Sign Up Instead
                            </Button>

                        </form>
                    </>) : (<>
                        <Typography variant='h5'> Sign UP </Typography>
                        <form style={{
                            width: "100%",
                            marginTop: "1rem",
                        }} onSubmit={handleSignIn}>
                            <Stack position={"relative"} width={"10rem"} margin={"auto"}>
                                <Avatar
                                    sx={{
                                        width: "10rem",
                                        height: "10rem",
                                        objectFit: "contain",
                                    }}
                                    src={avatar.preview}
                                />

                                <IconButton
                                    sx={{
                                        position: "absolute",
                                        bottom: "0",
                                        right: "0",
                                        color: "white",
                                        bgcolor: "rgba(0,0,0,0.5)",
                                        ":hover": {
                                            bgcolor: "rgba(0,0,0,0.7)",
                                        },
                                    }}
                                    component="label"
                                >
                                    <>
                                        <CameraAltIcon />
                                        <VisuallyHiddenInput
                                            type="file"
                                            onChange={avatar.changeHandler}
                                        />
                                    </>

                                </IconButton>
                            </Stack>
                            {avatar.error && (
                                <Typography
                                    m={"1rem auto"}
                                    width={"fit-content"}
                                    display={"block"}
                                    color="error"
                                    variant="caption"
                                >
                                    {avatar.error}
                                </Typography>
                            )}
                            <TextField
                                required
                                fullWidth
                                label="Name"
                                margin="normal"
                                variant="outlined"
                                value={name.value}
                                onChange={name.changeHandler}
                            />

                            <TextField
                                required
                                fullWidth
                                label="Bio"
                                margin="normal"
                                variant="outlined"
                                value={bio.value}
                                onChange={bio.changeHandler}
                            />
                            <TextField
                                required
                                fullWidth
                                label="Username"
                                margin="normal"
                                variant="outlined"
                                value={username.value}
                                onChange={username.changeHandler}
                            />
                            {username.error && (
                                <Typography color="error" variant="caption">
                                    {username.error}
                                </Typography>
                            )}


                            <TextField
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                margin="normal"
                                variant="outlined"
                                value={password.value}
                                onChange={password.changeHandler}
                            />

                            <Button
                                sx={{
                                    marginTop: "1rem",
                                }}
                                variant="contained"
                                color="primary"
                                type="submit"
                                fullWidth
                                disabled={isLoading}

                            >
                                Sign UP
                            </Button>
                            <Typography textAlign={"center"} m={"1rem"}>
                                OR
                            </Typography>
                            <Button
                                fullWidth
                                variant="text"
                                onClick={toggleLogin}
                                disabled={isLoading}
                            >
                                Login Instead
                            </Button>

                        </form>
                    </>)
                }
            </Paper>
        </Container>
        </div>
    )
}

export default Login