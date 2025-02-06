import React from 'react';
import { X, User } from 'lucide-react';
import type { FamilyMember } from '../types';

interface ProfileViewProps {
  member: FamilyMember;
  onClose: () => void;
}

export default function ProfileView({ member, onClose }: ProfileViewProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[480px] shadow-lg rounded-md bg-white">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center mb-6">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.name}
              className="w-32 h-32 rounded-full object-cover mb-4"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <User className="w-16 h-16 text-gray-500" />
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">ठेगाना</h3>
            <p className="text-gray-900">{member.address}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">मोबाइल</h3>
            <p className="text-gray-900">{member.mobile}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">जन्म मिति</h3>
            <p className="text-gray-900">{member.dob}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">स्थिति</h3>
            <p className="text-gray-900">{member.isAlive ? 'जीवित' : 'स्वर्गीय'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">पुस्ता</h3>
            <p className="text-gray-900">{member.generationId}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">नाता</h3>
            <p className="text-gray-900">{member.relation}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">पेशा</h3>
            <p className="text-gray-900">{member.occupation}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">शिक्षा</h3>
            <p className="text-gray-900">{member.education}</p>
          </div>

          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-500">फेसबुक</h3>
            <p className="text-gray-900">
              {member.facebookId && (
                <a
                  href={`https://facebook.com/${member.facebookId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {member.facebookId}
                </a>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}