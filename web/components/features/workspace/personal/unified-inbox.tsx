"use client";

import { useWorkspaceStore } from "../store/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, MessageSquare, AtSign, Inbox as InboxIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function UnifiedInbox() {
  const { notifications, markNotificationRead } = useWorkspaceStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-full flex flex-col bg-background/50">
       <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
             <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Bell className="h-5 w-5" />
             </div>
             <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                   Inbox
                   {unreadCount > 0 && <Badge variant="destructive" className="rounded-full px-2">{unreadCount}</Badge>}
                </h2>
                <p className="text-sm text-muted-foreground">Stay updated with your team activity</p>
             </div>
          </div>

          <div className="flex gap-2 mb-4">
             <Button variant="secondary" size="sm" className="rounded-full">All</Button>
             <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">Mentions</Button>
             <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">Assigned</Button>
          </div>
       </div>

       <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-10">
             {notifications.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                   <InboxIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                   <p>All caught up! No new notifications.</p>
                </div>
             ) : (
                notifications.map(noti => (
                  <Card
                     key={noti.id}
                     className={`p-4 flex gap-4 transition-colors ${noti.read ? 'opacity-60 bg-muted/20' : 'bg-card border-l-4 border-l-orange-500'}`}
                  >
                     <div className="mt-1">
                        {noti.type === 'mention' && <AtSign className="h-5 w-5 text-blue-500" />}
                        {noti.type === 'assignment' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {noti.type === 'update' && <MessageSquare className="h-5 w-5 text-yellow-500" />}
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <p className="text-sm font-medium">{noti.message}</p>
                           <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{noti.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                           {/* Context Link Mock */}
                           <Button variant="outline" size="sm" className="h-7 text-xs">View context</Button>
                           {!noti.read && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markNotificationRead(noti.id)}>Mark read</Button>
                           )}
                        </div>
                     </div>
                  </Card>
                ))
             )}
          </div>
       </ScrollArea>
    </div>
  );
}
