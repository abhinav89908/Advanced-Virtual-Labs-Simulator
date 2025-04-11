
import React, { useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useRoom } from '@/context/RoomContext';
import { Card } from '@/components/ui/card';

const Editor: React.FC = () => {
  const { content, updateContent } = useRoom();

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateContent(value);
    }
  };

  // You would implement collaborative editing features here
  // using something like Y.js or ShareDB in a real app

  return (
    <Card className="h-full overflow-hidden border border-border">
      <MonacoEditor
        height="600px"
        defaultLanguage="markdown"
        value={content}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          wrappingIndent: 'indent',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontSize: 14,
          tabSize: 2,
        }}
        theme="vs"
      />
    </Card>
  );
};

export default Editor;
