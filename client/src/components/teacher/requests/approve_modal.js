// approve_modal.js
import React, { useState } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import Button from '@mui/material/Button';
import ApproveIcon from '@mui/icons-material/Approve';

function ApproveModal({ projectId, approveProject }) {
  const [visible, setVisible] = useState(false);

  const handleApproveProject = async () => {
    try {
      await approveProject(projectId);
      setVisible(false);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <>
      <Button onClick={() => setVisible(!visible)} variant="outlined" startIcon={<ApproveIcon />}>Approve</Button>
      <CModal
        backdrop="static"
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader closeButton>
          <CModalTitle id="StaticBackdropExampleLabel">APPROVE REQUEST?</CModalTitle>
        </CModalHeader>
        <CModalBody id="approve_modal_body">
          Are you sure you want to approve this Request ?<br></br>
          <br></br>
          This process cannot be undone unless removed by student.
        </CModalBody>
        <CModalFooter>
          <Button color="secondary" variant="outlined" onClick={() => setVisible(false)}>
            CANCEL
          </Button>
          <Button color="primary" onClick={handleApproveProject} variant="outlined" startIcon={<ApproveIcon />}>
            CONFIRM DELETE
          </Button>
        </CModalFooter>
      </CModal>
    </>
  );
}

export default ApproveModal;
