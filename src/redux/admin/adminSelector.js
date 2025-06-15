import { createSelector } from "@reduxjs/toolkit";

export const selectAdmin = (state) => state.admin;

export const selectAdminId = createSelector([selectAdmin], (admin) => admin.id);

export const selectAdminName = createSelector(
  [selectAdmin],
  (admin) => admin.name
);

export const selectAdminEmail = createSelector(
  [selectAdmin],
  (admin) => admin.email
);

export const selectAdminRole = createSelector(
  [selectAdmin],
  (admin) => admin.role
);

export const selectAdminToken = createSelector(
  [selectAdmin],
  (admin) => admin.token
);