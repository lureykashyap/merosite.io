import React, { useState } from 'react';
import { Edit2, User, UserPlus, Trash2 } from 'lucide-react';
import type { TreeNode, RelationType } from '../types';
import ProfileView from './ProfileView';
import { supabase } from '../lib/supabase';

interface FamilyTreeProps {
  data: TreeNode;
  onEdit: (id: string) => void;
  onAddRelative: (memberId: string, relationType: RelationType) => void;
  onDelete?: (id: string) => void;
}

export default function FamilyTree({ data, onEdit, onAddRelative, onDelete }: FamilyTreeProps) {
  const [selectedMember, setSelectedMember] = useState<TreeNode['member'] | null>(null);
  const [showRelativeMenu, setShowRelativeMenu] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [deletingMember, setDeletingMember] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('के तपाईं यो सदस्यलाई मेटाउन निश्चित हुनुहुन्छ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (onDelete) {
        onDelete(id);
      }
      
      setDeletingMember(null);
      window.location.reload(); // Refresh to update the tree
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('सदस्य मेटाउन समस्या भयो।');
    }
  };

  const renderNode = (node: TreeNode) => {
    const { member } = node;
    const hasChildren = node.children.length > 0;
    const children = node.children.filter(child => child.member.relation !== 'spouse');
    const spouses = node.children.filter(child => child.member.relation === 'spouse');
    
    return (
      <div className="relative flex flex-col items-center" key={member.id}>
        {/* Member card with spouse(s) */}
        <div className="flex items-center gap-4 mb-8">
          {/* Main member card */}
          <div 
            className="relative group"
            onMouseEnter={() => setEditingMember(member.id)}
            onMouseLeave={() => setEditingMember(null)}
          >
            <div className="bg-white p-4 rounded-lg shadow-md border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 min-w-[280px]">
              <div className="flex items-center gap-4">
                <div 
                  className="cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                >
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.address}</p>
                  <p className="text-xs text-gray-500">पुस्ता: {member.generationId}</p>
                </div>
                {editingMember === member.id && (
                  <div className="absolute right-2 top-2 flex gap-2 bg-white shadow-lg rounded-lg p-1">
                    <button
                      onClick={() => onEdit(member.id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="सदस्य सम्पादन"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 hover:bg-red-100 rounded-full transition-colors"
                      title="सदस्य मेटाउनुहोस्"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowRelativeMenu(showRelativeMenu === member.id ? null : member.id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="नयाँ सदस्य थप्नुहोस्"
                      >
                        <UserPlus className="w-4 h-4 text-gray-600" />
                      </button>
                      {showRelativeMenu === member.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                onAddRelative(member.id, 'child');
                                setShowRelativeMenu(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              सन्तान थप्नुहोस्
                            </button>
                            <button
                              onClick={() => {
                                onAddRelative(member.id, 'spouse');
                                setShowRelativeMenu(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              जीवनसाथी थप्नुहोस्
                            </button>
                            <button
                              onClick={() => {
                                onAddRelative(member.id, 'sibling');
                                setShowRelativeMenu(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              दाजुभाई/दिदीबहिनी थप्नुहोस्
                            </button>
                            <button
                              onClick={() => {
                                onAddRelative(member.id, 'parent');
                                setShowRelativeMenu(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              अभिभावक थप्नुहोस्
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Spouses */}
          {spouses.map((spouse, index) => (
            <React.Fragment key={spouse.member.id}>
              <div className="flex items-center">
                <div className="w-8 h-0.5 bg-gray-300" />
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white" />
                <div className="w-8 h-0.5 bg-gray-300" />
              </div>
              {renderNode(spouse)}
            </React.Fragment>
          ))}
        </div>

        {/* Children container */}
        {hasChildren && children.length > 0 && (
          <>
            <div className="w-0.5 h-8 bg-gray-300" />
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2 w-full h-0.5 bg-gray-300" />
              <div className="flex justify-center gap-16 pt-8">
                {children.map((child) => (
                  <div key={child.member.id} className="relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-0.5 h-8 bg-gray-300" />
                    {renderNode(child)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 overflow-auto min-h-screen">
      <div className="flex justify-center">
        {renderNode(data)}
      </div>
      {selectedMember && (
        <ProfileView
          member={selectedMember}
          onClose={() => {
            setSelectedMember(null);
            setShowRelativeMenu(null);
          }}
        />
      )}
    </div>
  );
}