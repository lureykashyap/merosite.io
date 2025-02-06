import React, { useState, useEffect } from 'react';
import { TreeNode, FamilyMember, RelationType } from './types';
import FamilyTree from './components/FamilyTree';
import MemberForm from './components/MemberForm';
import AuthPage from './components/AuthPage';
import { supabase } from './lib/supabase';
import { LogOut } from 'lucide-react';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<{
    memberId: string;
    type: RelationType;
  } | null>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(supabase.auth.getUser());

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        await fetchFamilyMembers();
      } else {
        setTreeData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setTreeData(null);
      setError(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('साइन आउट गर्न समस्या भयो।');
    }
  };

  const buildTreeData = (members: any[], parentId: string | null = null): TreeNode[] => {
    return members
      .filter(m => m.parent_id === parentId)
      .map(member => ({
        member: {
          id: member.id,
          name: member.name,
          address: member.address,
          mobile: member.mobile,
          dob: member.dob,
          isAlive: member.is_alive,
          generationId: member.generation_id,
          occupation: member.occupation,
          education: member.education,
          facebookId: member.facebook_id,
          relation: member.relation,
          photoUrl: member.photo_url,
        },
        children: buildTreeData(members, member.id),
      }));
  };

  const fetchFamilyMembers = async () => {
    try {
      const { data: members, error: fetchError } = await supabase
        .from('family_members')
        .select('*')
        .order('generation_id');

      if (fetchError) {
        throw fetchError;
      }

      if (members && members.length > 0) {
        const rootMembers = buildTreeData(members);
        setTreeData(rootMembers[0]);
      } else {
        setTreeData(null);
      }
      setError(null);
    } catch (error: any) {
      console.error('Error fetching family members:', error);
      setError('परिवारका सदस्यहरू प्राप्त गर्न समस्या भयो। कृपया पुन: प्रयास गर्नुहोस्।');
      setTreeData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (member: FamilyMember) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('कृपया पहिले साइन इन गर्नुहोस्।');

      const memberData = {
        name: member.name,
        address: member.address,
        mobile: member.mobile,
        dob: member.dob,
        is_alive: member.isAlive,
        generation_id: member.generationId,
        occupation: member.occupation,
        education: member.education,
        facebook_id: member.facebookId,
        relation: member.relation,
        photo_url: member.photoUrl,
        user_id: user.id,
        parent_id: selectedRelation?.memberId || null,
      };

      if (editingMember) {
        const { error: updateError } = await supabase
          .from('family_members')
          .update(memberData)
          .eq('id', editingMember.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('family_members')
          .insert([memberData]);

        if (insertError) throw insertError;
      }

      await fetchFamilyMembers();
      setEditingMember(null);
      setSelectedRelation(null);
      setShowForm(false);
      setError(null);
    } catch (error: any) {
      console.error('Error saving family member:', error);
      setError('सदस्य सुरक्षित गर्न समस्या भयो। कृपया पुन: प्रयास गर्नुहोस्।');
    }
  };

  const handleEdit = (id: string) => {
    if (!treeData) return;

    const findMember = (node: TreeNode): FamilyMember | null => {
      if (node.member.id === id) return node.member;
      for (const child of node.children) {
        const found = findMember(child);
        if (found) return found;
      }
      return null;
    };

    const member = findMember(treeData);
    if (member) {
      setEditingMember(member);
      setShowForm(true);
    }
  };

  const handleAddRelative = (memberId: string, relationType: RelationType) => {
    setSelectedRelation({ memberId, type: relationType });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchFamilyMembers();
    } catch (error) {
      console.error('Error refreshing after delete:', error);
      setError('परिवार वृक्ष अपडेट गर्न समस्या भयो। कृपया पृष्ठ पुन: लोड गर्नुहोस्।');
    }
  };

  if (!user) {
    return <AuthPage onAuthSuccess={() => setLoading(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-mukta">लोड हुँदैछ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">पारिवारिक वंश वृक्ष</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            साइन आउट
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="px-4 py-6 sm:px-0">
          <button
            onClick={() => setShowForm(true)}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            परिवारको सदस्य थप्नुहोस्
          </button>

          <div className="bg-white shadow rounded-lg">
            {treeData ? (
              <FamilyTree
                data={treeData}
                onEdit={handleEdit}
                onAddRelative={handleAddRelative}
                onDelete={handleDelete}
              />
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 font-mukta">कुनै परिवारका सदस्यहरू फेला परेनन्</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showForm && (
        <MemberForm
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingMember(null);
            setSelectedRelation(null);
          }}
          initialData={editingMember}
          relationType={selectedRelation?.type}
          relationToMemberId={selectedRelation?.memberId}
        />
      )}
    </div>
  );
}

export default App;