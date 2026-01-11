"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Settings } from "lucide-react";

interface LiveHuddlePreviewProps {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
    onJoin: () => void;
}

export function LiveHuddlePreview({ projectId, isOpen, onClose, onJoin }: LiveHuddlePreviewProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing media devices.", err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !micOn);
            setMicOn(!micOn);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !videoOn);
            setVideoOn(!videoOn);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-slate-950 text-white border-slate-800">
                <DialogHeader className="sr-only">
                    <DialogTitle>Voice Channel Preview</DialogTitle>
                    <DialogDescription>Check your audio and video settings before joining.</DialogDescription>
                </DialogHeader>
                 <div className="flex h-[400px]">
                    {/* Left: Preview */}
                    <div className="flex-1 relative bg-black flex items-center justify-center">
                        <video ref={videoRef} autoPlay muted playsInline className={`h-full w-full object-cover ${!videoOn ? 'hidden' : ''}`} />
                        {!videoOn && (
                            <div className="h-32 w-32 rounded-full bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-400 border-4 border-slate-700">
                                Me
                            </div>
                        )}

                        <div className="absolute bottom-6 flex gap-4">
                             <Button
                                variant={micOn ? "secondary" : "destructive"}
                                size="icon"
                                className="h-12 w-12 rounded-full shadow-lg"
                                onClick={toggleMic}
                             >
                                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                             </Button>
                             <Button
                                variant={videoOn ? "secondary" : "destructive"}
                                size="icon"
                                className="h-12 w-12 rounded-full shadow-lg"
                                onClick={toggleVideo}
                             >
                                {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                             </Button>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="w-[280px] border-l border-slate-800 p-6 flex flex-col items-center">
                         <h2 className="text-xl font-bold mb-1">Team Huddle</h2>
                         <p className="text-sm text-slate-400 mb-8">Voice Channel</p>

                         <div className="w-full space-y-4 mb-auto">
                            <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Ready to join?</div>
                             <div className="text-sm text-slate-500 text-center py-4 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
                                Click below to enter the recurring Huddle.
                            </div>
                         </div>

                         <div className="w-full space-y-3">
                             <Button className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={onJoin}>
                                Join Room
                             </Button>
                             <div className="flex justify-center">
                                 <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                     <Settings className="h-4 w-4 mr-2" /> Audio Settings
                                 </Button>
                             </div>
                         </div>
                    </div>
                 </div>
            </DialogContent>
        </Dialog>
    );
}
