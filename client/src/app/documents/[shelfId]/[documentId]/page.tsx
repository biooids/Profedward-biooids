// app/documents/[shelfId]/[documentId]/page.tsx

import { use } from "react";
import DocumentWorkspace from "@/components/documents/view/DocumentWorkspace";

interface PageProps {
  params: Promise<{
    documentId: string;
    shelfId: string;
  }>;
}

export default function DocumentViewPage({ params }: PageProps) {
  const resolvedParams = use(params);

  return <DocumentWorkspace documentId={resolvedParams.documentId} />;
}
