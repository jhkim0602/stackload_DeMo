import React, { useState, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Users } from "lucide-react";
// import { useSocketStore } from "../../store/socket-store"; // SDK should have its own socket logic or hook

interface User {
  id: string;
  name: string;
}

interface MeetingRoomProps {
  roomId: string; // projectId
  currentUser: User;
  participants: User[]; // Initial or managed externally? For now passed in.
  onClose: () => void;
  // Simplified for Sidebar Mode
  mode?: 'full' | 'sidebar';
}

export function MeetingRoom({ roomId, currentUser, participants: initialParticipants, onClose, mode = 'sidebar' }: MeetingRoomProps) {
   // Real Media Logic
   const [stream, setStream] = useState<MediaStream | null>(null);
   const [micOn, setMicOn] = useState(true);
   const [videoOn, setVideoOn] = useState(true);
   const [isScreenSharing, setIsScreenSharing] = useState(false);
   const [participants] = useState(initialParticipants);
   const [permissionError, setPermissionError] = useState(false);
   const localVideoRef = React.useRef<HTMLVideoElement>(null);

   // Initialize Camera on mount
   useEffect(() => {
     startCamera();
     return () => {
         stream?.getTracks().forEach(track => track.stop());
     };
   }, []);

   const startCamera = async () => {
       try {
           const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
           setStream(mediaStream);
           setIsScreenSharing(false);
           setPermissionError(false);
       } catch (err) {
           console.error("Failed to access media devices", err);
           setPermissionError(true);
       }
   };

   const startScreenShare = async () => {
       try {
           const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
           setStream(displayStream);
           setIsScreenSharing(true);

           // Detect stop sharing (via browser UI)
           displayStream.getVideoTracks()[0].onended = () => {
               stopScreenShare();
           };
       } catch (err) {
           console.error("Failed to share screen", err);
       }
   }

   const stopScreenShare = async () => {
       // Return to camera
       await startCamera();
   }

   useEffect(() => {
       // Attach stream to video element
       if (localVideoRef.current && stream) {
           localVideoRef.current.srcObject = stream;
       }
   }, [stream]);

   // Toggle handlers
   useEffect(() => {
      if(stream && !isScreenSharing) {
          stream.getAudioTracks().forEach(t => t.enabled = micOn);
          stream.getVideoTracks().forEach(t => t.enabled = videoOn);
      }
   }, [micOn, videoOn, stream, isScreenSharing]);



   return (
    <div className="flex flex-col h-full w-full relative font-sans bg-transparent">
       {/* Top Bar - Removed as the overlay header handles it */}

       {/* Main Layout Area */}
       <div className="flex-1 overflow-hidden p-4 relative">
           {/* Screen Share "Stage" Mode */}
           {isScreenSharing && mode === 'full' ? (
               <div className="h-full w-full flex gap-4">
                   {/* Main Stage (Screen) */}
                   <div className="flex-1 bg-muted/30 rounded-2xl border border-border flex items-center justify-center p-2 relative shadow-lg">
                        <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-contain ${!isScreenSharing ? 'hidden' : ''}`} />
                        <div className="absolute top-4 left-4 bg-background/80 px-3 py-1 rounded-full text-xs font-semibold text-foreground backdrop-blur-md border border-border shadow-sm">
                            {currentUser.name}'s Screen
                        </div>
                   </div>
                   {/* Sidebar Strip for Participants */}
                   <div className="w-64 flex flex-col gap-3 overflow-y-auto pr-1">
                        {/* Camera Feed while sharing */}
                        <div className="aspect-video w-full bg-card rounded-xl overflow-hidden shadow-md border border-border relative shrink-0 group">
                             {!videoOn ? (
                                 <div className="w-full h-full flex items-center justify-center bg-muted">
                                     <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">M</div>
                                 </div>
                             ) : (
                                 <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                             )}
                             <div className="absolute bottom-2 left-2 text-xs font-medium text-white px-2 py-0.5 bg-black/50 rounded-md backdrop-blur-sm">You</div>
                        </div>
                       {participants.map(p => (
                           <div key={p.id} className="aspect-video w-full bg-card rounded-xl overflow-hidden shadow-md border border-border relative shrink-0 group">
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                     <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">{p.name.charAt(0)}</div>
                                </div>
                                <div className="absolute bottom-2 left-2 text-xs font-medium text-white px-2 py-0.5 bg-black/50 rounded-md backdrop-blur-sm">{p.name}</div>
                           </div>
                       ))}
                   </div>
               </div>
           ) : (
               /* Standard Grid Mode (Adaptive Theme) */
               <div className={`h-full w-full overflow-y-auto ${mode === 'full' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-content-center p-4' : 'flex flex-col gap-4'}`}>
                    {/* Local User */}
                    <div className={`relative overflow-hidden shadow-lg rounded-2xl border border-border bg-card transition-all hover:shadow-xl group ${mode === 'full' ? 'w-full aspect-video' : 'h-48 w-full shrink-0'}`}>
                        <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full ${mode === 'full' ? 'object-contain bg-black' : 'object-cover'} ${!videoOn && !isScreenSharing ? 'hidden' : ''}`} />

                        {!videoOn && !isScreenSharing && !permissionError && (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
                                <div className={`border-4 border-background rounded-full bg-muted flex items-center justify-center shadow-inner mb-3 ${mode === 'full' ? 'h-24 w-24' : 'h-16 w-16'}`}>
                                    <span className={`font-bold text-muted-foreground ${mode === 'full' ? 'text-3xl' : 'text-xl'}`}>Me</span>
                                </div>
                            </div>
                        )}
                        {permissionError && (
                             <div className="w-full h-full flex flex-col items-center justify-center bg-destructive/10">
                                 <div className={`mx-auto mb-3 flex items-center justify-center text-destructive bg-background rounded-full shadow-sm hover:scale-110 transition-transform ${mode === 'full' ? 'h-24 w-24' : 'h-16 w-16'}`}>
                                     <MicOff className={`${mode === 'full' ? 'h-10 w-10' : 'h-8 w-8'}`} />
                                 </div>
                                 <div className="font-semibold text-destructive mb-1">Check Permissions</div>
                             </div>
                        )}

                        {/* Name Tag (Adaptive) */}
                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-background/80 backdrop-blur-md rounded-md border border-border flex items-center gap-2 shadow-sm">
                             {micOn ? <Mic className="h-3 w-3 text-green-500" /> : <MicOff className="h-3 w-3 text-destructive" />}
                             <span className="text-xs font-semibold text-foreground tracking-wide">You</span>
                        </div>
                    </div>

                    {/* Participants */}
                    {participants.map((user) => (
                        <div key={user.id} className={`relative overflow-hidden shadow-lg rounded-2xl border border-border bg-card transition-all hover:shadow-xl group ${mode === 'full' ? 'w-full aspect-video' : 'h-48 w-full shrink-0'}`}>
                           <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
                               <div className={`border-4 border-background rounded-full bg-primary/10 flex items-center justify-center shadow-inner mb-3 ${mode === 'full' ? 'h-24 w-24' : 'h-16 w-16'}`}>
                                   <span className={`font-bold text-primary ${mode === 'full' ? 'text-3xl' : 'text-xl'}`}>{user.name.charAt(0)}</span>
                               </div>
                           </div>
                           <div className="absolute bottom-3 left-3 px-2 py-1 bg-background/80 backdrop-blur-md rounded-md border border-border flex items-center gap-2 shadow-sm">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-foreground tracking-wide">{user.name}</span>
                           </div>
                        </div>
                    ))}
               </div>
           )}
       </div>

       {/* Floating Control Bar (Glass Dock Style) */}
       <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${mode === 'sidebar' ? 'hidden' : 'flex'}`}>
          <div className="flex items-center gap-3 bg-background/60 p-2 pl-4 pr-3 rounded-2xl border border-border/50 data-[state=open]:border-primary shadow-2xl backdrop-blur-xl hover:bg-background/80 transition-all hover:scale-105">
            <button
               className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${micOn ? "bg-muted hover:bg-muted/80 text-foreground" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`}
               onClick={() => setMicOn(!micOn)}
               title={micOn ? "Mute" : "Unmute"}
            >
               {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>

            <button
               className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${videoOn ? "bg-muted hover:bg-muted/80 text-foreground" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`}
               onClick={() => setVideoOn(!videoOn)}
               disabled={isScreenSharing}
               title={videoOn ? "Stop Video" : "Start Video"}
            >
               {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>

            <button
                className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${isScreenSharing ? 'bg-green-500 text-white' : 'bg-muted hover:bg-muted/80 text-foreground'}`}
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                title="Share Screen"
              >
                <MonitorUp className="h-5 w-5" />
            </button>

            <div className="w-px h-6 bg-border mx-1" />

            <button
                className="h-11 w-11 rounded-xl bg-destructive hover:bg-destructive/90 text-white flex items-center justify-center transition-all shadow-lg shadow-destructive/20"
                onClick={onClose}
                title="Leave Huddle"
             >
                <PhoneOff className="h-5 w-5" />
             </button>
          </div>
       </div>
    </div>
  );
}
