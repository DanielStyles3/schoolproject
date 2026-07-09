import { useEffect } from "react";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${title} | YabaTech Academic System`;

    // Restore title on unmount
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
