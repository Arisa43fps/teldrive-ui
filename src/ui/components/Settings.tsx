import React, { memo, useCallback, useEffect, useState } from "react"
import { AccountStats, Settings } from "@/ui/types"
import { defaultFormatters, FileData } from "@bhunter179/chonky"
import { AccountCircle, WatchLater } from "@mui/icons-material"
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { Control, Controller, SubmitHandler, useForm } from "react-hook-form"
import { useIntl } from "react-intl"

import { useSession } from "@/ui/hooks/useSession"
import useSettings from "@/ui/hooks/useSettings"
import http from "@/ui/utils/http"

type SettingsProps = {
  open: boolean
  onClose: () => void
}

enum SettingsSection {
  Account = "account",
  Other = "other",
}

const categories = [
  {
    id: "account",
    name: "Account",
    icon: <AccountCircle />,
  },
  { id: "other", name: "Other", icon: <WatchLater /> },
]

const AccountTab = memo(() => {
  const intl = useIntl()

  const accountCards = [
    {
      title: "Total Storage",
      dataKey: "totalSize",
      formatter: (value: number) =>
        defaultFormatters.formatFileSize(intl, {
          size: value,
        } as FileData),
    },
    {
      title: "Total Files",
      dataKey: "totalFiles",
    },
  ]

  const { data: session } = useSession()

  const { data, isLoading } = useQuery({
    queryKey: ["user", "stats", session?.userName],
    queryFn: async () =>
      (await http.get<AccountStats>("/api/users/stats")).data,
  })

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {accountCards.map((card, index) => (
          <Box key={card.dataKey} sx={{ margin: "auto" }}>
            {isLoading ? (
              <Skeleton
                sx={{
                  height: 140,
                  width: "50%",
                  maxHeight: 140,
                  minWidth: 200,
                  borderRadius: "20px",
                }}
                animation="wave"
                variant="rectangular"
              />
            ) : (
              <Card
                sx={{
                  width: "50%",
                  maxHeight: 140,
                  minWidth: 200,
                  cursor: "pointer",
                  bgcolor: "primaryContainer.main",
                }}
              >
                <CardContent>
                  <Typography variant="h5" component="div">
                    {card.title}
                  </Typography>
                  <Typography variant="h4" component="div">
                    {card.formatter
                      ? card.formatter(data?.[card.dataKey] as number)
                      : data?.[card.dataKey]}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        ))}
      </Box>
    </>
  )
})

const OtherTab: React.FC<{ control: Control<Settings, any> }> = memo(
  ({ control }) => {
    return (
      <>
        <Controller
          name="apiUrl"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              margin="normal"
              id="apiUrl"
              fullWidth
              error={!!error}
              type="text"
              label="API URL"
              helperText={error ? error.message : ""}
            />
          )}
        />
      </>
    )
  }
)

function SettingsDialog({ open, onClose }: SettingsProps) {
  const { settings, setSettings } = useSettings()

  const [tabId, setTabID] = useState<string>(SettingsSection.Account)

  const [isSaving, setIsSaving] = useState(false)

  const { control, handleSubmit } = useForm<Settings>({
    defaultValues: settings,
  })

  const { data: session } = useSession()

  useEffect(() => {
    if (!session) setTabID(SettingsSection.Other)
  }, [session])

  const onSubmit: SubmitHandler<Settings> = useCallback(
    async (settings) => {
      switch (tabId) {
        case SettingsSection.Other:
          const { apiUrl } = settings
          setSettings({ apiUrl })
          break
        default:
          break
      }
    },
    [tabId]
  )
  const renderTabSection = useCallback(() => {
    switch (tabId) {
      case SettingsSection.Account:
        return <>{session && <AccountTab />}</>

      case SettingsSection.Other:
        return <OtherTab control={control} />

      default:
        return null
    }
  }, [tabId])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: "75vw", maxWidth: 800, height: "70vh" },
      }}
    >
      <DialogTitle>Settings</DialogTitle>
      <Box sx={{ height: "8px" }}>{isSaving && <LinearProgress />}</Box>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: "1rem",
            height: "100%",
          }}
        >
          <List sx={{ minWidth: "160px", width: "25%" }}>
            {categories
              .filter((item) => {
                if (item.id !== "other" && !session) {
                  return false
                }
                return true
              })
              .map(({ id: childId, name, icon }) => (
                <ListItem
                  sx={{ paddingLeft: 0, paddingRight: 2 }}
                  key={childId}
                >
                  <ListItemButton
                    selected={tabId === childId}
                    onClick={() => setTabID(childId)}
                  >
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText>{name}</ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
          <Divider orientation="vertical" variant="middle" flexItem />
          <Box
            id="hook-form"
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ flex: 1 }}
          >
            {renderTabSection()}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={isSaving} type="submit" form="hook-form">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsDialog
