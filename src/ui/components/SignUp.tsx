import { useCallback, useState } from "react"
import { Message } from "@/ui/types"
import { Box, TextField } from "@mui/material"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Controller, useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"

import http from "@/ui/utils/http"

type FormState = {
  userName: string
  password: string
  email: string
}
export default function SignUp() {
  const [isLoading, setLoading] = useState(false)

  const { control, handleSubmit } = useForm<FormState>({
    defaultValues: {
      userName: "",
      password: "",
      email: "",
    },
  })

  const location = useLocation()

  const navigate = useNavigate()

  const from = location.state?.from?.pathname || "/"

  const queryClient = useQueryClient()

  const onSubmit = useCallback(async (payload: FormState) => {
    setLoading(true)
    try {
      await http.post<Message>("/api/auth/signup", payload)
      await queryClient.invalidateQueries({ queryKey: ["session"] })
      navigate(from ? from : "/my-drive", { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error((err.response?.data as Message).error!)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <Container component="main" maxWidth="sm">
      <Paper
        sx={{
          borderRadius: 2,
          px: 4,
          py: 6,
          marginTop: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <Typography component="h1" variant="h5">
          Signup
        </Typography>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={!isLoading ? handleSubmit(onSubmit) : undefined}
          sx={{
            width: "90%",
            gap: "1rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Controller
            name="userName"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                error={!!error}
                type="text"
                label="UserName"
                helperText={error ? error.message : ""}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            rules={{
              required: true,
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "invalid email format",
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                error={!!error}
                type="email"
                label="Email"
                helperText={error ? error.message : ""}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                error={!!error}
                type="password"
                label="Password"
                helperText={error ? error.message : ""}
              />
            )}
          />
          <Button
            type="submit"
            fullWidth
            variant="tonal"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? "Please Wait…" : "Enter"}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
