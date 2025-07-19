import React, { useRef } from 'react';
import JoditEditor from 'jodit-react';
import { cn } from '@/lib/utils';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Enter content...",
  className,
  config = {},
  ...props 
}) => {
  const editor = useRef(null);

  const defaultConfig = {
    placeholder: placeholder,
    height: 400,
    theme: 'default',
    toolbar: [
      'source',
      '|',
      'bold',
      'strikethrough',
      'underline',
      'italic',
      '|',
      'ul',
      'ol',
      '|',
      'outdent',
      'indent',
      '|',
      'font',
      'fontsize',
      'brush',
      'paragraph',
      '|',
      'image',
      'link',
      'table',
      '|',
      'align',
      'undo',
      'redo',
      '|',
      'hr',
      'eraser',
      'copyformat',
      '|',
      'fullsize'
    ],
    buttons: [
      'source', '|', 'bold', 'strikethrough', 'underline', 'italic', '|',
      'ul', 'ol', '|', 'outdent', 'indent', '|', 'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'link', 'table', '|', 'align', 'undo', 'redo', '|', 'hr', 'eraser', 'copyformat', '|', 'fullsize'
    ],
    uploader: {
      insertImageAsBase64URI: true
    },
    removeButtons: ['about'],
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    defaultActionOnPaste: 'insert_clear_html',
    ...config
  };

  return (
    <div className={cn("border rounded-md", className)}>
      <JoditEditor
        ref={editor}
        value={value}
        config={defaultConfig}
        onBlur={(newContent) => onChange(newContent)}
        onChange={() => {}}
        {...props}
      />
    </div>
  );
};

export { RichTextEditor }; 