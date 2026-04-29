'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Cloud, CloudAlert, Loader, 
  Heading1, Heading2, Bold, Italic, List, 
  Eye, Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button'; 

type DocumentType = {
  id: string | number;
  title: string;
  content: string;
  updated_at: string;
};

export function EditorClient({ initialDocument }: { initialDocument: DocumentType }) {
  const [title, setTitle] = useState(initialDocument.title);
  const [content, setContent] = useState(initialDocument.content || "");
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const [view, setView] = useState<'edit' | 'preview'>('edit');

  const isMounted = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const saveDocument = async () => {
      setStatus('saving');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/document.php?id=${initialDocument.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', 
          body: JSON.stringify({ title, content })
        });
        if (!res.ok) throw new Error('Salvataggio fallito');
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000); 
      } catch (error) {
        setStatus('error');
      }
    };

    const timeoutId = setTimeout(() => saveDocument(), 1000);
    return () => clearTimeout(timeoutId);
  }, [title, content, initialDocument.id]);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const newText = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length, 
        end + prefix.length
      );
    }, 0);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-8 relative">
      
      <div className="absolute top-4 right-8 flex items-center gap-2 text-sm text-muted-foreground">
        {status === 'saving' && <><Loader className="h-4 w-4 animate-spin" /> Salvataggio...</>}
        {status === 'saved' && <><Cloud className="h-4 w-4 text-green-500" /> Salvato</>}
        {status === 'error' && <><CloudAlert className="h-4 w-4 text-destructive" /> Errore</>}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titolo del documento"
        className="text-4xl font-bold mb-6 outline-none bg-transparent placeholder:text-muted-foreground/50 border-none focus:ring-0 w-full"
      />

      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex gap-1">
          <Button 
            variant="ghost" size="sm" 
            onClick={() => insertMarkdown('# ', '')} 
            disabled={view === 'preview'} title="Titolo 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" size="sm" 
            onClick={() => insertMarkdown('## ', '')} 
            disabled={view === 'preview'} title="Titolo 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1 self-center" />

          <Button 
            variant="ghost" size="sm" 
            onClick={() => insertMarkdown('**', '**')} 
            disabled={view === 'preview'} title="Grassetto"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" size="sm" 
            onClick={() => insertMarkdown('*', '*')} 
            disabled={view === 'preview'} title="Corsivo"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 self-center" />
          <Button 
            variant="ghost" size="sm" 
            onClick={() => insertMarkdown('- ', '')} 
            disabled={view === 'preview'} title="Lista puntata"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex bg-muted/50 p-1 rounded-lg border">
          <Button
            variant={view === 'edit' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setView('edit')}
          >
            <Edit3 className="h-3 w-3 mr-2" />
            Editor
          </Button>
          <Button
            variant={view === 'preview' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setView('preview')}
          >
            <Eye className="h-3 w-3 mr-2" />
            Preview
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {view === 'edit' ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Inizia a scrivere in Markdown..."
            className="w-full h-full text-lg outline-none bg-transparent resize-none placeholder:text-muted-foreground/50 border-none focus:ring-0 min-h-[500px]"
          />
        ) : (
          <div className="w-full min-h-[500px] text-lg leading-relaxed">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
                p: ({node, ...props}) => <p className="mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
              }}
            >
              {content || "*Nessun contenuto da visualizzare.*"}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}