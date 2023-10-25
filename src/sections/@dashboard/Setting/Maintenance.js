import { useState } from 'react';
import Stack from '@mui/material/Stack';
import { Button, Card, Grid, TextareaAutosize, Typography } from '@mui/material';
import Switch from '@mui/material/Switch';
import EditIcon from '@mui/icons-material/Edit';

export default function Maintenance({ maintenance, handleMaintenance, saveHandler }) {
  const label = { inputProps: { 'aria-label': 'Maintenance Status' } };
  const [isEdit, setIsEdit] = useState(false);

  const handleEditOpen = () => setIsEdit(true);

  const handleEditClose = () => setIsEdit(false);

  const handleSave = () => {
    if (confirm('Do you want to update the maintenance details?') == true) {
      saveHandler((isUpdated) => {
        if (isUpdated) {
          handleEditClose();
        }
      });
    }
  };

  return (
    <>
      <Card sx={{ padding: '20px' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={12}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
              <p>
                <b>Maintenance Status:</b>
              </p>
              <Switch
                {...label}
                checked={maintenance.enabled}
                onChange={(e) => handleMaintenance(e.target.checked, 'status')}
                disabled={!isEdit}
              />
              {!isEdit && (
                <Button
                  sx={{
                    background: '#9F3239',
                    color: '#fff',
                    transition: '1s',
                    '&: hover': {
                      background: '#9F3239',
                      color: '#fff',
                      transition: '1s',
                    },
                  }}
                  variant="contained"
                  onClick={handleEditOpen}
                >
                  <EditIcon />
                  Edit
                </Button>
              )}
            </Stack>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-start', alignItems: 'center' }}>
              {/* <p>
              <b>Message:</b>
            </p> */}
              {/* <p>{maintenance.message}</p> */}
              <Typography fontWeight={'bold'}>Message: </Typography>
              <br />
              <TextareaAutosize
                aria-label="Maintenance Message"
                placeholder="Maintenance Message"
                style={{ width: 300 }}
                value={maintenance.message}
                onChange={(e) => handleMaintenance(e.target.value, 'message')}
                disabled={!isEdit}
              />
            </Stack>
            {isEdit && (
              <Stack
                direction="row"
                spacing={2}
                sx={{ justifyContent: 'flex-end', alignItems: 'center', marginTop: '20px' }}
              >
                <Button
                  sx={{
                    background: '#9F3239',
                    color: '#fff',
                    transition: '1s',
                    '&: hover': {
                      background: '#9F3239',
                      color: '#fff',
                      transition: '1s',
                    },
                  }}
                  variant="contained"
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  sx={{
                    marginTop: '10px',
                    border: '1px solid #9F3239',
                    color: '#9F3239',
                    background: 'transparent',
                    '&: hover': {
                      border: '1px solid #9F3239',
                      color: '#9F3239',
                      background: 'transparent',
                    },
                  }}
                  variant="outlined"
                  onClick={handleEditClose}
                >
                  Cancel
                </Button>
              </Stack>
            )}
          </Grid>
        </Grid>
      </Card>
    </>
  );
}
