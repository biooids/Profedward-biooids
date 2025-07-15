// app/documents/[shelfId]/[documentId]/page.tsx

// This page remains a Server Component for SEO and fast initial load.
import DocumentWorkspace from "@/components/documents/view/DocumentWorkspace";

interface PageProps {
  params: {
    documentId: string;
    shelfId: string; // The URL still contains the shelfId
  };
}

// --- THIS IS THE FIX ---
// Mark the component as `async` to allow awaiting props.
export default async function DocumentViewPage({ params }: PageProps) {
  // Although not strictly necessary here, it's good practice to resolve the promise.
  const resolvedParams = await params;

  // We pass the resolved documentId to the workspace, which will handle all data fetching.
  return <DocumentWorkspace documentId={resolvedParams.documentId} />;
}
