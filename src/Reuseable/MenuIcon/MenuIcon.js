import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';

export default function MenuIcon({ editItem, item, type }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();
  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoreVertIcon sx={{ color: '#9F3239' }} />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {type === 'category' && !item?.name.toLowerCase()?.includes('super') && (
          <MenuItem
            onClick={() => {
              navigate(`/dashboard/categories/${item?.id}/products`, { state: item });
            }}
          >
            <Typography sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <VisibilityIcon /> View
            </Typography>
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            handleClose();
            editItem();
          }}
        >
          <Typography sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );
}
