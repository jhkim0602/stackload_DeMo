"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Paperclip, Smile, Hash, Volume2, AtSign } from "lucide-react";
import { useWorkspaceStore, ProjectMember } from "../../store/mock-data";
import { cn } from "@/lib/utils";
import { SmartInput } from "../../common/smart-input";

interface TeamChatProps {
  projectId: string;
  channelName?: string; // e.g. 'general'
}

export function TeamChat({ projectId, channelName = 'general' }: TeamChatProps) {
  const { projects, messages, sendMessage, setActiveTaskId } = useWorkspaceStore();
  const project = projects.find(p => p.id === projectId);

  // Filter messages for this channel
  const channelMessages = messages.filter(m => m.channelId === channelName);

  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
     if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
     }
  }, [channelMessages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(channelName, inputValue, 'u1', 'user');
    setInputValue('');
  };

  const getMember = (id: string) => project?.members.find(m => m.id === id);

  const parseContent = (content: string) => {
    const regex = /\[#(.*?):(.*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      const taskId = match[1];
      const taskTitle = match[2];

      parts.push(
        <button
          key={match.index}
          onClick={() => setActiveTaskId(taskId)}
          className="text-primary hover:underline font-medium inline-flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded transition-colors"
        >
          <Hash className="h-3 w-3" />
          {taskTitle}
        </button>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className="flex flex-col h-full bg-background relative" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="h-14 border-b flex items-center px-6 justify-between flex-shrink-0">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Hash className="h-5 w-5 text-muted-foreground" />
          {channelName}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex -space-x-2 mr-2">
            {project?.members.slice(0, 3).map((m, i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-background">
                 <AvatarFallback>{m.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          {project?.members.length} members
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden relative">
         <ScrollArea className="h-full px-6 py-4">
            <div className="space-y-6">
               {channelMessages.map((msg) => {
                 const isSystem = msg.type === 'system';
                 const member = getMember(msg.senderId);

                 if (isSystem) {
                    return (
                       <div key={msg.id} className="flex justify-center my-4">
                          <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
                             {/* Basic Markdown-like parsing for bold text */}
                             <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                             <span className="ml-2 opacity-70">{msg.timestamp}</span>
                          </span>
                       </div>
                    );
                 }

                 return (
                   <div key={msg.id} className="flex gap-4 group">
                      <Avatar className="h-10 w-10 mt-0.5">
                         <AvatarFallback>{member?.name.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                         <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{member?.name || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                         </div>
                         <p className="text-sm mt-1 text-foreground/90 leading-relaxed whitespace-pre-wrap">{parseContent(msg.content)}</p>
                      </div>
                   </div>
                 );
               })}
               <div ref={scrollRef} />
            </div>
         </ScrollArea>
      </div>

       <div className="p-4 border-t bg-background mt-auto">
         <div className="border rounded-xl shadow-sm bg-muted/30 focus-within:ring-1 ring-primary/30 transition-shadow">
            <SmartInput
              value={inputValue}
              onChange={setInputValue}
              onEnter={handleSend}
              className="px-4 py-3"
              placeholder={`Message #${channelName}`}
            />
            <div className="flex items-center justify-between px-2 pb-2">
               <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setInputValue(prev => prev + '@')}>
                     <AtSign className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                     <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                     <Smile className="h-4 w-4" />
                  </Button>
               </div>
               <Button size="sm" onClick={handleSend} disabled={!inputValue.trim()} className={!inputValue.trim() ? "opacity-50" : ""}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
