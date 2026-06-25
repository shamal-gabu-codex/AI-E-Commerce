"use client";

import Swal from "sweetalert2";

export async function confirmAction(message = "Are you sure you want to process this action?") {
  const result = await Swal.fire({
    title: "Please confirm",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-xl",
      confirmButton: "app-action mx-1",
      cancelButton: "app-secondary mx-1 border-0",
      actions: "gap-2"
    }
  });

  return result.isConfirmed;
}
