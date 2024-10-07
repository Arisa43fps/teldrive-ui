import { memo } from "react";
import Editor from "@monaco-editor/react";
import { Spinner } from "@tw-material/react";

import useFileContent from "@/hooks/use-file-content";
import { getLanguageByFileName } from "@/utils/preview-type";

interface CodePreviewProps {
  name: string;
  assetUrl: string;
}
const CodePreview = ({ name, assetUrl }: CodePreviewProps) => {
  const { response: content, validating } = useFileContent(assetUrl);

  return (
    <>
      {validating ? null : (
        <Editor
          loading={<Spinner />}
          defaultLanguage={getLanguageByFileName(name)}
          theme="vs-dark"
          height="100%"
          value={content}
        />
      )}
    </>
  );
};

export default memo(CodePreview);
