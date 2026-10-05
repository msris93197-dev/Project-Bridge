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
      <Button onClick={() => setVisible(!visible)} variant="outlined" startIcon={<DeleteIcon />}>Delete</Button>
      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader closeButton>
          <CModalTitle id="StaticBackdropExampleLabel">DELETE PROJECT?</CModalTitle>
        </CModalHeader>
        <CModalBody id="delete_modal_body">
          Are you sure you want to delete this project ?<br></br>
          <br></br>
          This process cannot be undone.
        </CModalBody>
        <CModalFooter>
          <Button color="secondary" variant="outlined" onClick={() => setVisible(false)}>
            CANCEL
          </Button>
          <Button color="primary" onClick={handleDeleteProject} variant="outlined" startIcon={<DeleteIcon />}>
            CONFIRM DELETE
          </Button>
        </CModalFooter>
      </CModal>
    </>
  );
}

export default DeleteModal;
