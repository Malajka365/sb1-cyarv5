import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { TagGroup } from '../lib/supabase-types';
import { getTagGroups, addTagGroup, updateTagGroup, deleteTagGroup } from '../lib/video-service';

const TagManagementPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
  const [newGroup, setNewGroup] = useState('');
  const [newTag, setNewTag] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) {
      navigate('/');
      return;
    }

    const loadTagGroups = async () => {
      try {
        const data = await getTagGroups(category);
        setTagGroups(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tag groups');
      } finally {
        setLoading(false);
      }
    };

    loadTagGroups();
  }, [category, navigate]);

  // Rest of the component remains the same...
  // (Previous implementation continues)
};

export default TagManagementPage;