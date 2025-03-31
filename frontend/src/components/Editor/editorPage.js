import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import './editorPage.css';

const EditorPage = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const editorRef = useRef(null);

  const handleSave = async () => {
    if (!title) {
      setStatus('Please enter a title');
      return;
    }

    try {
      setStatus('Saving...');
      const documentContent = editorRef.current.getContent();
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/drive/save`,
        {
          title,
          content: documentContent
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        }
      );

      setStatus(`Document saved successfully! View it here: ${response.data.webViewLink}`);
    } catch (error) {
      console.error('Save error:', error);
      setStatus(error.response?.data?.message || 'Failed to save document');
    }
  };

  return (
    <div className="editor-page">
      <div className="editor-header">
        <input
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
        <button onClick={handleSave} className="save-button">
          Save to Google Drive
        </button>
      </div>

      <Editor
        apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue=""
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
      />

      {status && (
        <div className={`status-message ${status.includes('successfully') ? 'success' : 'error'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default EditorPage;