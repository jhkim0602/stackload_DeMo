"use client";

import { useWorkspaceStore } from "../store/mock-data";
import { useState, useMemo } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { FileText, Plus, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DocsViewProps {
  projectId: string;
}

export function DocsView({ projectId }: DocsViewProps) {
  const { docs, createDoc, updateDoc } = useWorkspaceStore();
  const projectDocs = docs.filter(d => d.projectId === projectId);

  const [activeDocId, setActiveDocId] = useState<string | null>(projectDocs[0]?.id || null);

  const activeDoc = projectDocs.find(d => d.id === activeDocId);

  // Editor instance
  const editor = useCreateBlockNote({
     initialContent: activeDoc?.content as PartialBlock[] || undefined
  });

  // Handle content change
  const handleChange = () => {
     if (activeDocId) {
        // Debounce would be good here in real app
        updateDoc(activeDocId, editor.document);
     }
  };

  const handleCreateDoc = () => {
     createDoc({
       projectId,
       title: 'Untitled',
       content: [{ type: "heading", content: "Untitled" }]
     });
  };

  return (
    <div className="flex h-full">
      {/* Docs Sidebar */}
      <div className="w-60 border-r bg-muted/5 flex flex-col">
        <div className="p-3 border-b flex items-center justify-between">
          <span className="font-medium text-sm text-muted-foreground">Pages</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCreateDoc}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
           <div className="p-2 space-y-0.5">
              {projectDocs.map(doc => (
                 <button
                   key={doc.id}
                   onClick={() => {
                      setActiveDocId(doc.id);
                      // Reset editor content
                      if (editor) {
                          editor.replaceBlocks(editor.document, doc.content as PartialBlock[]);
                      }
                   }}
                   className={cn(
                     "flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted/50 transition-colors",
                     activeDocId === doc.id && "bg-muted font-medium"
                   )}
                 >
                   <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                   <span className="truncate">{doc.title}</span>
                 </button>
              ))}
           </div>
        </ScrollArea>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
         {activeDoc ? (
            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
               <div className="mb-8">
                 <input
                   className="text-4xl font-bold border-none outline-none w-full bg-transparent placeholder:text-muted-foreground"
                   value={activeDoc.title}
                   onChange={(e) => {
                      // Update title locally and in store
                      // For now direct store update in real app use updateDoc
                   }}
                   placeholder="Untitled"
                 />
               </div>
               <div className="editor-wrapper min-h-[500px]">
                 <BlockNoteView editor={editor} onChange={handleChange} theme="light" />
               </div>
            </div>
         ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
               Select or create a page
            </div>
         )}
      </div>
    </div>
  );
}
