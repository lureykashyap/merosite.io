export interface FamilyMember {
  id: string;
  name: string;
  address: string;
  mobile: string;
  dob: string;
  isAlive: boolean;
  generationId: number;
  occupation: string;
  education: string;
  facebookId: string;
  relation: string;
  photoUrl: string;
}

export interface TreeNode {
  member: FamilyMember;
  children: TreeNode[];
}

export type RelationType = 'child' | 'spouse' | 'sibling' | 'parent';