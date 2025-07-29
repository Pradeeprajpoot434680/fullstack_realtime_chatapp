import { axiosInstance } from "../lib/axios";
import { create } from "zustand";
import toast from "react-hot-toast";
import {io } from 'socket.io-client'

const BASE_URL = import.meta.env.MODE == 'development'?'http://localhost:8000':"/";
export const useAuthStore = create((set,get) => ({
  // Store state
  authUser: null,
  isCheckingAuth: true,
  isSigninUp: false,
  isLoggingIng: false,
  isUpdatingProfile: false,
  onlineUsers:[],
  socket:null,
  // Store actions
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
      // get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login:async(data)=>{
    set({isLoggingIng:true})
    try {
      const res = await axiosInstance.post('/auth/login',data);
      set({authUser:res.data})
      toast.success("Logged In successfully")
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message)
    }
    finally {
      set({isLoggingIng:false})
    }
  },
  logout:async ()=>{
    try {
      await axiosInstance.post('/auth/logout');
      set({authUser:null});
      toast.success("Logged out Successfully")
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.error)
    }
  },
  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put('/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in updating profile", error);
      toast.error("Error in updating profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket:()=>{
    const { authUser } = get();
    if(!authUser || get().socket?.connected)return;

    const soc = io(BASE_URL,{
      query:{
        userId:authUser._id
      }
    });
    soc.connect();
    set({socket:soc})

    soc.on('getOnlineUsers',(userIds)=>{
      set({ onlineUsers: userIds})
    })
    
    
  },
  disconnectSocket:()=>{
    if(get().socket?.connected) get().socket.disconnect();
  }
}));
