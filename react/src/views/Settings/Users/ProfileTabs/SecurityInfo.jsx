import { Tab, Form, Card, Row, Col, Button, Alert } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useUpdateSecurityInfoMutation } from "../../../../api/slices/userSlice.js";
import { notification } from "../../../../components/ToastNotification.jsx";

const _initials = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

export default function SecurityInfo({ user }) {
  const [data, setData] = useState(_initials);
  const [updateSecurityInfo, { isLoading }] = useUpdateSecurityInfoMutation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(null);

  useEffect(() => {
    if (user) {
      setData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }
  }, [user]);

  // Password strength calculation
  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      return strength;
    };
    setPasswordStrength(calculateStrength(data.new_password));
  }, [data.new_password]);

  // Password match validation
  useEffect(() => {
    if (data.confirm_password) {
      setPasswordMatch(data.new_password === data.confirm_password);
    } else {
      setPasswordMatch(null);
    }
  }, [data.new_password, data.confirm_password]);

  const getStrengthColor = () => {
    if (passwordStrength < 50) return "danger";
    if (passwordStrength < 75) return "warning";
    return "success";
  };

  const getStrengthText = () => {
    if (passwordStrength < 25) return "Very Weak";
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Medium";
    if (passwordStrength < 100) return "Strong";
    return "Very Strong";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (data.new_password !== data.confirm_password) {
      notification("error", "New password and confirm password do not match");
      return;
    }

    if (!data.current_password || !data.new_password) {
      notification("error", "Please fill in all required fields");
      return;
    }

    if (passwordStrength < 50) {
      notification("error", "Please choose a stronger password");
      return;
    }

    const formData = new FormData();
    formData.append("current_password", data.current_password);
    formData.append("new_password", data.new_password);
    formData.append("confirm_password", data.confirm_password);

    try {
      await updateSecurityInfo(formData).unwrap();
      notification("success", "Security information updated successfully!");
      setData(_initials); // Reset form
    } catch (error) {
      console.error("Error updating security info:", error);
      notification("error", error?.data?.message || "Failed to update security information");
    }
  };

  return (
    <>
      <Tab.Pane eventKey="security">
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                <i className="fas fa-shield-alt text-primary fs-4"></i>
              </div>
              <div>
                <Card.Title className="mb-1 fs-4 fw-bold text-dark">Security Settings</Card.Title>
                <p className="text-muted mb-0">Update your password to keep your account secure</p>
              </div>
            </div>

            <Alert variant="info" className="border-0 bg-info bg-opacity-10">
              <div className="d-flex align-items-center">
                <i className="fas fa-info-circle text-info me-2"></i>
                <div>
                  <strong>Password Requirements:</strong>
                  <ul className="mb-0 mt-2 small">
                    <li>At least 8 characters long</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Include at least one number</li>
                  </ul>
                </div>
              </div>
            </Alert>
            
            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-4" controlId="current_password" style={{ maxWidth: '400px' }}>
                 <Form.Label className="fw-semibold text-dark mb-2">
                   <i className="fas fa-key text-muted me-2"></i>
                   Current Password *
                 </Form.Label>
                 <div className="password-input">
                   <Form.Control
                     type={showCurrentPassword ? "text" : "password"}
                     placeholder="Enter your current password"
                     value={data.current_password}
                     onChange={(e) => {
                       setData({ ...data, current_password: e.target.value });
                     }}
                     className="custom-form-control"
                     required
                   />
                   <FontAwesomeIcon
                     icon={showCurrentPassword ? faEyeSlash : faEye}
                     className="eye-icon"
                     onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                   />
                 </div>
               </Form.Group>

               <Form.Group className="mb-3" controlId="new_password" style={{ maxWidth: '400px' }}>
                 <Form.Label className="fw-semibold text-dark mb-2">
                   <i className="fas fa-lock text-muted me-2"></i>
                   New Password *
                 </Form.Label>
                 <div className="password-input">
                   <Form.Control
                     type={showNewPassword ? "text" : "password"}
                     placeholder="Enter new password"
                     value={data.new_password}
                     onChange={(e) => {
                       setData({ ...data, new_password: e.target.value });
                     }}
                     className="custom-form-control"
                     required
                   />
                   <FontAwesomeIcon
                     icon={showNewPassword ? faEyeSlash : faEye}
                     className="eye-icon"
                     onClick={() => setShowNewPassword(!showNewPassword)}
                   />
                 </div>
               </Form.Group>

               <Form.Group className="mb-3" controlId="confirm_password" style={{ maxWidth: '400px' }}>
                 <Form.Label className="fw-semibold text-dark mb-2">
                   <i className="fas fa-check-circle text-muted me-2"></i>
                   Confirm New Password *
                 </Form.Label>
                 <div className="password-input">
                   <Form.Control
                     type={showConfirmPassword ? "text" : "password"}
                     placeholder="Confirm new password"
                     value={data.confirm_password}
                     onChange={(e) => {
                       setData({ ...data, confirm_password: e.target.value });
                     }}
                     className="custom-form-control"
                     required
                   />
                   <FontAwesomeIcon
                     icon={showConfirmPassword ? faEyeSlash : faEye}
                     className="eye-icon"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                   />
                 </div>
                 {passwordMatch === false && data.confirm_password && (
                   <div className="text-danger mt-2">
                     <i className="fas fa-times-circle me-1"></i>
                     <small>Passwords do not match</small>
                   </div>
                 )}
                 {passwordMatch === true && (
                   <div className="text-success mt-2">
                     <i className="fas fa-check-circle me-1"></i>
                     <small>Passwords match</small>
                   </div>
                 )}
               </Form.Group>

              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() => setData(_initials)}
                  disabled={isLoading}
                  className="px-4"
                >
                  <i className="fas fa-undo me-2"></i>
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || passwordMatch === false || passwordStrength < 50}
                  className="px-5 py-2 fw-semibold"
                  style={{ minWidth: '160px' }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Tab.Pane>
    </>
  );
}