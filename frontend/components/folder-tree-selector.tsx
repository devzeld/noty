'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, Check } from 'lucide-react';

export function FolderTreeSelector({ folders, selectedId, onSelect }: any) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const buildTree = (list: any[], parentId: any = null) => {
    return list
      .filter(f => f.parent_folder_id == parentId)
      .map(f => ({ ...f, children: buildTree(list, f.id) }));
  };

  const tree = buildTree(folders);

  const Node = ({ item, depth }: any) => {
    const isExpanded = expanded[item.id];
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div className="flex flex-col">
        <div 
          onClick={() => onSelect(item.id.toString())}
          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${selectedId == item.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
          style={{ paddingLeft: `${depth * 1.25}rem` }}
        >
          {hasChildren ? (
            <button onClick={(e) => { e.stopPropagation(); setExpanded({...expanded, [item.id]: !isExpanded}) }}>
              {isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            </button>
          ) : <span className="w-3.5" />}
          <Folder size={16} className={selectedId == item.id ? "fill-primary/20" : "fill-blue-500/10 text-blue-500"}/>
          <span className="text-sm truncate">{item.name}</span>
          {selectedId == item.id && <Check size={14} className="ml-auto" />}
        </div>
        {isExpanded && hasChildren && item.children.map((child: any) => (
          <Node key={child.id} item={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {tree.map(rootNode => <Node key={rootNode.id} item={rootNode} depth={0} />)}
    </div>
  );
}