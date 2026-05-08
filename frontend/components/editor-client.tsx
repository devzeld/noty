'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Cloud, CloudAlert, Loader, 
  Heading1, Heading2, Bold, Italic, List, 
  Eye, Edit3, Tags, Plus, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button'; 
import { updateDocumentAction } from '@/lib/actions/document-action';
import { getTagsAction, createTagAction, deleteTagAction } from '@/lib/actions/tag-action';

type DocumentType = {
  id: string | number;
  title: string;
  content: string;
  updated_at: string;
  tags?: { id: number; name: string; color: string }[];
};

type TagType = {
  id: number;
  name: string;
  color: string;
};

export function EditorClient({ initialDocument }: { initialDocument: DocumentType }) {
  const [title, setTitle] = useState(initialDocument.title);
  const [content, setContent] = useState(initialDocument.content || "");
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>(initialDocument.tags?.map(t => t.id) || []);
  const [showTags, setShowTags] = useState(false);
  
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6"); // Default blu
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const isMounted = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadTags = async () => {
    const tags = await getTagsAction();
    setAvailableTags(tags);
  };

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const saveDocument = async () => {
      setStatus('saving');
      try {
        await updateDocumentAction(initialDocument.id, { title, content });
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

    setContent(`${beforeText}${prefix}${selectedText}${suffix}${afterText}`);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const toggleTag = async (tagId: number) => {
    setStatus('saving');
    const newTags = selectedTags.includes(tagId) 
      ? selectedTags.filter(id => id !== tagId) 
      : [...selectedTags, tagId];
    
    setSelectedTags(newTags);
    
    try {
      await updateDocumentAction(initialDocument.id, { tag_ids: newTags });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000); 
    } catch (error) {
      setStatus('error');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsCreatingTag(true);
    try {
      const res = await createTagAction(newTagName, newTagColor);
      await loadTags();
      await toggleTag(res.id);
      
      setNewTagName("");
      setNewTagColor("#3b82f6");
    } catch (error) {
      console.error("Errore durante la creazione del tag", error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleDeleteTag = async (e: React.MouseEvent, tagId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if(confirm('Vuoi eliminare definitivamente questo tag? Verrà rimosso da tutti i documenti.')) {
        await deleteTagAction(tagId);
        // Rimuovilo dai selezionati se lo era
        setSelectedTags(prev => prev.filter(id => id !== tagId));
        await loadTags();
    }
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
        className="text-4xl font-bold mb-4 outline-none bg-transparent placeholder:text-muted-foreground/50 border-none focus:ring-0 w-full"
      />

      <div className="flex items-center gap-2 mb-6 relative">
        <Button variant="outline" size="sm" onClick={() => setShowTags(!showTags)}>
          <Tags className="w-4 h-4 mr-2" /> Tag
        </Button>
        <div className="flex gap-2 flex-wrap">
          {availableTags.filter(t => selectedTags.includes(t.id)).map(tag => (
            <span key={tag.id} className="px-2 py-1 text-xs rounded-full border font-medium" style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>

        {showTags && (
          <div className="absolute top-10 left-0 bg-background border shadow-xl rounded-lg p-3 w-64 z-20 flex flex-col gap-3">
            <div className="max-h-48 overflow-y-auto space-y-1">
              {availableTags.length === 0 ? (
                <p className="text-xs text-muted-foreground p-1">Nessun tag disponibile</p>
              ) : (
                availableTags.map(tag => (
                  <div key={tag.id} className="flex items-center justify-between p-1.5 hover:bg-muted rounded group">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input type="checkbox" checked={selectedTags.includes(tag.id)} onChange={() => toggleTag(tag.id)} className="rounded border-gray-300" />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span className="text-sm">{tag.name}</span>
                    </label>
                    <button onClick={(e) => handleDeleteTag(e, tag.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* FORM CREAZIONE NUOVO TAG */}
            <div className="border-t pt-3 flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Crea Nuovo Tag</span>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" 
                  value={newTagColor} 
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  title="Scegli colore"
                />
                <input 
                  type="text" 
                  placeholder="Nome tag..." 
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') handleCreateTag() }}
                  className="flex-1 h-8 px-2 text-sm border rounded-md bg-transparent outline-none focus:border-primary"
                />
              </div>
              <Button size="sm" onClick={handleCreateTag} disabled={isCreatingTag || !newTagName.trim()} className="w-full mt-1">
                {isCreatingTag ? <Loader className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1"/> Aggiungi</>}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => insertMarkdown('# ', '')} disabled={view === 'preview'} title="Titolo 1">
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertMarkdown('## ', '')} disabled={view === 'preview'} title="Titolo 2">
            <Heading2 className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 self-center" />
          <Button variant="ghost" size="sm" onClick={() => insertMarkdown('**', '**')} disabled={view === 'preview'} title="Grassetto">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertMarkdown('*', '*')} disabled={view === 'preview'} title="Corsivo">
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 self-center" />
          <Button variant="ghost" size="sm" onClick={() => insertMarkdown('- ', '')} disabled={view === 'preview'} title="Lista puntata">
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex bg-muted/50 p-1 rounded-lg border">
          <Button variant={view === 'edit' ? 'default' : 'ghost'} size="sm" className="h-7 px-3 text-xs" onClick={() => setView('edit')}>
            <Edit3 className="h-3 w-3 mr-2" /> Editor
          </Button>
          <Button variant={view === 'preview' ? 'default' : 'ghost'} size="sm" className="h-7 px-3 text-xs" onClick={() => setView('preview')}>
            <Eye className="h-3 w-3 mr-2" /> Preview
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