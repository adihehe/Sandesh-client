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

import React, { useEffect, useState } from 'react'
import { useInputValidation, useFileHandler } from "6pp"
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin, getAdmin } from "../../redux/Thunks/admin";

const AdminLogin = () => {
  const { isAdmin } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const secretKey = useInputValidation("");

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(adminLogin(secretKey.value));
  };

  useEffect(() => {
    dispatch(getAdmin());
  }, [dispatch]);

  if (isAdmin) return <Navigate to="/admin/dashboard" />;

    return (
        <div
          style={{
            backgroundImage:"linear-gradient(rgb(214 119 119), rgb(55 79 169)"
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
              <Typography variant="h5">Admin Login</Typography>
              <form
                style={{
                  width: "100%",
                  marginTop: "1rem",
                }}
                onSubmit={submitHandler}
              >
                <TextField
                  required
                  fullWidth
                  label="Secret Key"
                  type="password"
                  margin="normal"
                  variant="outlined"
                  value={secretKey.value}
                  onChange={secretKey.changeHandler}
                />
    
                <Button
                  sx={{
                    marginTop: "1rem",
                  }}
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                >
                  Login
                </Button>
              </form>
            </Paper>
          </Container>
        </div>
      );
}

export default AdminLogin