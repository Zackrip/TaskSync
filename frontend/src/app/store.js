import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "../features/counter/notificationSlice";

export const store = configureStore({
  reducer: {
    notification: notificationReducer,
  },
});