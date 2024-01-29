import Swal from 'sweetalert2';
import deleteIcon from '../assets/images/deleteIcon.svg';
import {
  BUTTON_NO_TEXT,
  BUTTON_YES_TEXT,
  CATEGORY_DELETE_WARNING,
} from './constant-values';

export const DeleteAlert = (value) => {
  return Swal.fire({
    icon: 'warning',
    title: value,
    confirmButtonText: BUTTON_YES_TEXT,
    cancelButtonText: BUTTON_NO_TEXT,
    showCloseButton: true,
    showCancelButton: true,
    confirmButtonColor: '#FC5050',
    cancelButtonColor: '#FFFFFF',
    focusConfirm: false,
    customClass: {
      title: 'sweetalert-title',
      htmlContainer: 'sweetalert-text',
      actions: 'sweetalert-actions',
      cancelButton: 'sweetalert-cancel',
      closeButton: 'sweetalert-close',
      container: 'sweetalert-container',
    },
  });
};

export const DeleteAlertImage = (value) => {
  return Swal.fire({
    title: value,
    imageUrl: `${deleteIcon}`,
    showCloseButton: true,
    showConfirmButton: false,
    customClass: {
      closeButton: 'sweetalert-close',
      title: 'sweetalert-sub-title',
      container: 'sweetalert-container',
    },
  });
};

export const DeleteAlertMessage = (value) => {
  return Swal.fire({
    title: value,
  });
};

export const CategoryDeleteAlert = (value, key) => {
  return Swal.fire({
    icon: 'warning',
    title:
      key?.children?.length || key[0]?.children?.length === undefined
        ? value
        : CATEGORY_DELETE_WARNING,
    confirmButtonText: BUTTON_YES_TEXT,
    cancelButtonText: BUTTON_NO_TEXT,
    showCloseButton: true,
    showCancelButton:
      key?.children?.length || key[0]?.children?.length === undefined,
    showConfirmButton:
      key?.children?.length || key[0]?.children?.length === undefined,
    confirmButtonColor: '#FC5050',
    cancelButtonColor: '#FFFFFF',
    focusConfirm: false,
    customClass: {
      title: 'sweetalert-title',
      htmlContainer: 'sweetalert-text',
      actions: 'sweetalert-actions',
      cancelButton: 'sweetalert-cancel',
      closeButton: 'sweetalert-close',
      container: 'sweetalert-container',
    },
  });
};

export const DeleteAlertAssociated = (value, text) => {
  return Swal.fire({
    icon: 'warning',
    title: value,
    text,
    showCancelButton: true,
    confirmButtonText: BUTTON_YES_TEXT,
    cancelButtonText: BUTTON_NO_TEXT,
    showCloseButton: true,
    confirmButtonColor: '#FC5050',
    cancelButtonColor: '#FFFFFF',
    focusConfirm: false,
    customClass: {
      title: 'sweetalert-title',
      htmlContainer: 'sweetalert-text',
      actions: 'sweetalert-actions',
      cancelButton: 'sweetalert-cancel',
      closeButton: 'sweetalert-close',
    },
  });
};
