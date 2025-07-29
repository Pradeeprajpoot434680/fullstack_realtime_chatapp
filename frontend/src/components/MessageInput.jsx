import React, { useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import { X,Image, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
function MessageInput() {
    const [text,setText] = useState("");
    const [imagePreview,setImagePreview]= useState(null);
    const fileInputRef = useRef(null);
    const { sendMessage } = useChatStore();
    const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
    }

    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
    };

    try {
        const compressedFile = await imageCompression(file, options);

        // Convert compressed file to base64 string
        const reader = new FileReader();
        reader.onloadend = () => {
        const base64data = reader.result; // this will be a base64 data URL string
        setImagePreview(base64data); // set the base64 image for preview & sending
        };
        reader.readAsDataURL(compressedFile);
    } catch (error) {
        console.error("Image compression failed:", error);
        toast.error("Failed to process image.");
    }
    };


    const removeImage = ()=>{
        setImagePreview(null);
        if(fileInputRef.current)fileInputRef.current.value = "";
    };
    const handleSendMessage =async (e)=>{
        e.preventDefault();
        if(!text.trim() && !imagePreview)return;
            console.log(text);
            console.log(imagePreview);
            
            
        try {
            await sendMessage({
                text:text.trim(),
                image:imagePreview
            })

            setText("");
            setImagePreview(null);
            if(fileInputRef.current)fileInputRef.current.value = "";

        } catch (error) {
            console.log("Failed to send message",error);
            
        }

    };
  return (
    <div className='p-4 w-full'>
         {imagePreview && (
            <div className='mb-3 flex items-center gap-2'>
                <div className='relative'>
                    <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className='w-20 h-20 object-cover rounded-lg border border-zinc-700'
                    />
                    <button
                    onClick={removeImage}
                    className='absolute -top-1.5 -right-1.5 h-5 rounded-full bg-base-300 file items-center justify-center'
                    type='button'
                    >
                        <X className='size-3'/>
                    </button>
                </div>
            </div>
         )}
         <form onSubmit={handleSendMessage} className='flex items-center gap-2 border-white-100 shadow-md rounded-md p-2'>
            <div className='flex-1 flex gap-2 '>
                <input 
                type="text"
                className='w-full input-bordered rounded-lg input-sm sm:input-md pl-4'
                placeholder='Type a message...'
                value={text}
                onChange={(e)=>{setText(e.target.value)}}
                />
                <input
                type='file'
                accept='image/*'
                className='hidden'
                ref={fileInputRef}
                onChange={handleImageSelect}
                />

                <button
                type='button'
                className={`hidden sm:flex btn btn-circle
                    ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
                    onClick={()=>fileInputRef.current?.click()}
                >
                    <Image size={20}/>
                </button> 

            </div>
            <div>
                <button
                type='submit'
                className='btn btn-sm btn-circle'
                disabled={!(text.trim()) && !imagePreview}
                >
                    <Send size={22}/>
                </button>
            </div>  
         </form>
    </div>
  )
}

export default MessageInput