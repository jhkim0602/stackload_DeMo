"use client";

import React, { useEffect, useState } from 'react';
import { MeetingRoom } from './MeetingRoom';
// import { useSocketStore } from '../../store/socket-store'; // Assuming we can access the store, or we pass props

interface GlobalHuddleSidebarProps {
    projectId: string;
    currentUser: { id: string; name: string };
    isOpen: boolean;
    onClose: () => void;
}

export function GlobalHuddleSidebar({ projectId, currentUser, isOpen, onClose }: GlobalHuddleSidebarProps) {
    // Mock participants for now or fetch from store
    const participants = [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' }
    ];

    if (!isOpen) return null;

    return (
        <div className="w-[360px] border-r border-slate-200 bg-white h-full shadow-lg z-40 flex flex-col transition-all duration-300">
            <MeetingRoom
                roomId={projectId}
                currentUser={currentUser}
                participants={participants}
                onClose={onClose}
                mode="sidebar"
            />
        </div>
    );
}
