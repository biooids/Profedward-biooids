"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Download,
  Save,
  PanelRightOpen,
  PanelLeftOpen,
  Loader2,
  AlertTriangle,
  Edit,
  FileScan,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AiSidecar from "./AiSidecar";
import HighlightMenu, { HighlightAction } from "./HighlightMenu";
import {
  useGetDocumentByIdQuery,
  useUpdateDocumentMutation,
  useExportDocumentMutation,
} from "@/lib/document/documentApiSlice";
import {
  useProcessAiActionMutation,
  useGetHistoryForDocumentQuery,
  useGetConversationMessagesQuery,
} from "@/lib/ai/aiApiSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TiptapEditor from "@/components/editor/TiptapEditor";
import { ChatMessage } from "@/lib/ai/aiTypes";

// --- TTS INTEGRATION: Import Redux tools and the player component ---
import { useDispatch } from "react-redux";
import { openPlayer } from "@/lib/tts/ttsSlice";
import AudioPlayerBar from "./AudioPlayerBar";
import UserQuotaDisplay from "./UserQuotaDisplay";

const DocumentViewer = dynamic(() => import("./DocumentViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex w-full h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-4">Loading PDF...</p>
    </div>
  ),
});

export type AiAction = "summarize" | "explain" | "quiz" | "ask";
export type SidecarTab = "chat" | "history";

export default function DocumentWorkspace({
  documentId,
}: {
  documentId: string;
}) {
  const { status } = useSession();
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch(); // <-- TTS Integration: Get the dispatch function

  // --- Data Fetching ---
  const {
    data: documentData,
    isLoading: isDocLoading,
    isError,
  } = useGetDocumentByIdQuery(documentId, { skip: status !== "authenticated" });
  const [updateDocument, { isLoading: isSaving }] = useUpdateDocumentMutation();
  const [processAiAction, { isLoading: isAiLoading }] =
    useProcessAiActionMutation();
  const [exportDocument, { isLoading: isExporting }] =
    useExportDocumentMutation();
  const { data: conversationHistoryList = [] } = useGetHistoryForDocumentQuery(
    documentId,
    { skip: !documentId }
  );

  // --- State Management ---
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const { data: fetchedMessages, isFetching: isMessagesFetching } =
    useGetConversationMessagesQuery(activeConversationId!, {
      skip: !activeConversationId,
    });

  const [editorContent, setEditorContent] = useState<any>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSidecarVisible, setIsSidecarVisible] = useState(true);
  const [isMobileSidecarOpen, setIsMobileSidecarOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [highlightMenuPos, setHighlightMenuPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [currentChatMessages, setCurrentChatMessages] = useState<ChatMessage[]>(
    []
  );
  const [activeSidecarTab, setActiveSidecarTab] = useState<SidecarTab>("chat");

  // --- Effects ---
  useEffect(() => {
    if (documentData) {
      setDocumentTitle(documentData.name);
      if (documentData.editableContent) {
        setEditorContent(documentData.editableContent);
      }
    }
  }, [documentData]);

  useEffect(() => {
    if (activeConversationId && fetchedMessages) {
      setCurrentChatMessages(fetchedMessages);
    } else if (activeConversationId === null) {
      setCurrentChatMessages([]);
    }
  }, [activeConversationId, fetchedMessages]);

  useEffect(() => {
    if (!documentData) return;
    const isTitleChanged =
      documentData.name !== documentTitle && documentTitle.trim() !== "";
    const isContentChanged =
      editorContent && documentData.editableContent
        ? JSON.stringify(documentData.editableContent) !==
          JSON.stringify(editorContent)
        : false;
    setIsDirty(isTitleChanged || isContentChanged);
  }, [documentTitle, editorContent, documentData]);

  useEffect(() => {
    if (isAiLoading || isMessagesFetching) {
      return;
    }

    if (activeConversationId && conversationHistoryList.length > 0) {
      const activeConvoExists = conversationHistoryList.some(
        (c) => c.id === activeConversationId
      );
      if (!activeConvoExists) {
        setActiveConversationId(null);
      }
    }
  }, [
    conversationHistoryList,
    activeConversationId,
    isAiLoading,
    isMessagesFetching,
  ]);

  // --- Event Handlers ---
  const handleSaveChanges = async () => {
    if (!documentData || !isDirty || isSaving) return;
    try {
      await updateDocument({
        documentId: documentData.id,
        data: { name: documentTitle, content: editorContent },
      }).unwrap();
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
  };

  const handleDownload = async () => {
    if (!documentData) return;
    try {
      const blob = await exportDocument(documentId).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${documentData.name}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export document:", error);
    }
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();
    if (text && text.length > 10) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = contentAreaRef.current?.getBoundingClientRect();
      if (containerRect) {
        setSelectedText(text);
        setHighlightMenuPos({
          top: rect.top - containerRect.top - 50,
          left: rect.left - containerRect.left + rect.width / 2,
        });
      }
    } else {
      setHighlightMenuPos(null);
    }
  }, []);

  const handleSelectConversation = (id: string | null) => {
    setActiveConversationId(id);
    setActiveSidecarTab("chat");
  };

  const handleAiAction = async (action: AiAction, query?: string) => {
    if (!documentData) return;
    setHighlightMenuPos(null);
    setActiveSidecarTab("chat");

    const textToProcess = query || selectedText;
    if (!textToProcess && action !== "ask") return;

    const userMessage: ChatMessage = { role: "human", content: textToProcess };

    const updatedHistory = [...currentChatMessages, userMessage];
    setCurrentChatMessages(updatedHistory);

    try {
      const response = await processAiAction({
        documentId: documentData.id,
        action: action,
        conversationId: activeConversationId ?? undefined,
        text_selection: action !== "ask" ? textToProcess : undefined,
        chat_query: action === "ask" ? textToProcess : undefined,
        chat_history: updatedHistory,
      }).unwrap();

      if (!activeConversationId) {
        setActiveConversationId(response.conversationId);
      }
    } catch (err) {
      const errorResponse: ChatMessage = {
        role: "ai",
        content: "An AI error occurred. Please try again.",
      };
      setCurrentChatMessages((prev) => [...prev.slice(0, -1), errorResponse]);
    }
  };

  // --- TTS INTEGRATION: New handler for actions from the highlight menu ---
  const handleHighlightAction = (action: HighlightAction) => {
    setHighlightMenuPos(null); // Close menu on action
    if (action === "read_aloud") {
      if (selectedText) {
        dispatch(openPlayer(selectedText));
      }
    } else {
      // For all other actions, call the existing AI handler
      handleAiAction(action, selectedText);
    }
  };

  // --- Render Logic ---
  if (status === "loading" || (status === "authenticated" && isDocLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (isError || !documentData) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="ml-2">Could not load document.</p>
      </div>
    );
  }

  const hasEditableContent = !!documentData.editableContent;
  const hasOriginalScan = !!documentData.originalFileUrl;
  const defaultTab = hasEditableContent ? "editor" : "scan";

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 flex-1">
          <Button variant="outline" size="icon" asChild>
            <Link
              href={
                documentData.shelfId
                  ? `/documents/${documentData.shelfId}`
                  : "/documents"
              }
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Input
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="text-xl font-bold h-10 border-transparent hover:border-input focus-visible:ring-1"
          />
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {hasEditableContent && (
            <Button onClick={handleSaveChanges} disabled={!isDirty || isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidecarVisible(!isSidecarVisible)}
            className="hidden md:flex"
          >
            {isSidecarVisible ? (
              <PanelRightOpen className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileSidecarOpen(true)}
            className="md:hidden"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div
          ref={contentAreaRef}
          onMouseUp={handleTextSelection}
          className="flex-1 flex flex-col overflow-hidden relative"
        >
          {highlightMenuPos && (
            <HighlightMenu
              position={highlightMenuPos}
              onAction={handleHighlightAction}
            />
          )}
          <Tabs
            defaultValue={defaultTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-4 pt-4 border-b">
              <TabsList>
                {hasEditableContent && (
                  <TabsTrigger value="editor">
                    <Edit className="mr-2 h-4 w-4" />
                    Editor
                  </TabsTrigger>
                )}
                {hasOriginalScan && (
                  <TabsTrigger value="scan">
                    <FileScan className="mr-2 h-4 w-4" />
                    Original Scan
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            {hasEditableContent && (
              <TabsContent value="editor" className="flex-1 overflow-y-auto">
                <TiptapEditor
                  key={documentData.id}
                  initialContent={documentData.editableContent}
                  onUpdate={(c) => setEditorContent(JSON.parse(c))}
                  editable={true}
                />
              </TabsContent>
            )}
            <UserQuotaDisplay />
            {hasOriginalScan && (
              <TabsContent value="scan" className="flex-1 overflow-hidden">
                <DocumentViewer
                  documentUrl={documentData.originalFileUrl}
                  editableContent={null}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
        {isSidecarVisible && (
          <div className="hidden md:flex border-l">
            <AiSidecar
              activeSidecarTab={activeSidecarTab}
              onSidecarTabChange={setActiveSidecarTab}
              isLoading={isAiLoading || isMessagesFetching}
              chatHistory={currentChatMessages}
              selectedText={selectedText}
              onAiAction={handleAiAction}
              conversationHistoryList={conversationHistoryList}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              isMobileOpen={false}
              onMobileClose={() => {}}
            />
          </div>
        )}
      </main>
      <AiSidecar
        className="md:hidden"
        activeSidecarTab={activeSidecarTab}
        onSidecarTabChange={setActiveSidecarTab}
        isMobileOpen={isMobileSidecarOpen}
        onMobileClose={() => setIsMobileSidecarOpen(false)}
        isLoading={isAiLoading || isMessagesFetching}
        chatHistory={currentChatMessages}
        selectedText={selectedText}
        onAiAction={handleAiAction}
        conversationHistoryList={conversationHistoryList}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
      />

      {/* --- TTS INTEGRATION: Render the player bar at the root of the layout --- */}
      <AudioPlayerBar />
    </div>
  );
}
