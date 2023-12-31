import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import CategoriesModal from '../Modal/BookModal';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from 'src/services/firebase';

export default function MenuIcon({ editItem, item, type, setShowModal, setBookHandler }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  // const [isEditable, setIsEditable] = React.useState(false);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditBooks = () => {
    setShowModal(true);
    setBookHandler(item); //callback function (child to parent props)
  };

  // const handleDeleteBook = async () => {
  //   await deleteDoc(doc(db, 'books', item.id));
  //   // console.log("delete book",item.id)
  // };

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
        {/* {type === 'category' && !item?.name.toLowerCase()?.includes('super') && (
          <MenuItem
            onClick={() => {
              navigate(`/dashboard/categories/${item?.id}/products`, { state: item });
            }}
          >
            <Typography sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <VisibilityIcon /> View
            </Typography>
          </MenuItem>
        )} */}

        <MenuItem
          onClick={() => {
            handleClose();
            handleEditBooks();
          }}
        >
          <Typography sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </Typography>

          <br />
        </MenuItem>

        {/* <MenuItem
          onClick={() => {
            handleClose();
            handleDeleteBook();
          }}
        >
          <Typography sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </Typography>

          <br />
        </MenuItem> */}
      </Menu>
    </div>
  );
}
