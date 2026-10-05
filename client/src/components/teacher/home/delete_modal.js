// delete_modal.js
import React, { useState } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';

function DeleteModal({ projectId, deleteProject }) {
  const [visible, setVisible] = useState(false);

  const handleDeleteProject = async () => {
    try {
      await deleteProject(projectId);
      setVisible(false);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <>
      <Button size="small" color="error" onClick={() => setVisible(!visible)} variant="outlined" startIcon={<DeleteIcon />}>Delete</Button>
      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader closeButton>
          <CModalTitle id="StaticBackdropExampleLabel">Delete this project?</CModalTitle>
        </CModalHeader>
        <CModalBody id="delete_modal_body">
          This will permanently remove the project and its student requests. This cannot be undone.
        </CModalBody>
        <CModalFooter>
          <Button color="inherit" variant="text" onClick={() => setVisible(false)}>
            Cancel
          </Button>
          <Button color="error" onClick={handleDeleteProject} variant="contained" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </CModalFooter>
      </CModal>
    </>
  );
}

export default DeleteModal;
