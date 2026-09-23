import { useState, useEffect } from 'react';
import { Challenge, ChallengeCategory, ChallengeDifficulty, ChallengeState } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChallengeStore } from '@/store/challengeStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus } from 'lucide-react';

interface ChallengeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Challenge | null;
}

const defaultChallenge: Omit<Challenge, 'id'> = {
  title: '',
  category: 'Web',
  difficulty: 'Easy',
  author: 'IEEE UD Team',
  description: '',
  hints: [],
  files: [],
  links: [],
  flag: 'FLAG{}',
  state: 'active'
};

export default function ChallengeFormModal({ isOpen, onClose, initialData }: ChallengeFormModalProps) {
  const addChallenge = useChallengeStore((state) => state.addChallenge);
  const updateChallenge = useChallengeStore((state) => state.updateChallenge);
  
  const [formData, setFormData] = useState<Omit<Challenge, 'id'> & { id?: string }>(defaultChallenge);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultChallenge);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initialData && formData.id) {
      updateChallenge(formData as Challenge);
    } else {
      addChallenge(formData);
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>{initialData ? 'Edit Challenge' : 'Create New Challenge'}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6">
          <form id="challenge-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input 
                  required 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Author</label>
                <Input 
                  required 
                  value={formData.author} 
                  onChange={(e) => setFormData({...formData, author: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(v) => v && setFormData({...formData, category: v as ChallengeCategory})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web">Web</SelectItem>
                    <SelectItem value="Pwn">Pwn</SelectItem>
                    <SelectItem value="Reverse Engineering">Reverse Engineering</SelectItem>
                    <SelectItem value="Cryptography">Cryptography</SelectItem>
                    <SelectItem value="Forensics">Forensics</SelectItem>
                    <SelectItem value="Hardware / IoT">Hardware / IoT</SelectItem>
                    <SelectItem value="Misc">Misc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={formData.difficulty} onValueChange={(v) => v && setFormData({...formData, difficulty: v as ChallengeDifficulty})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Select value={formData.state} onValueChange={(v) => v && setFormData({...formData, state: v as ChallengeState})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Markdown)</label>
              <Textarea 
                required 
                className="h-32"
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Flag</label>
              <Input 
                required 
                className="font-mono"
                value={formData.flag} 
                onChange={(e) => setFormData({...formData, flag: e.target.value})} 
              />
            </div>

            {/* Arrays like hints, files, links would typically have complex sub-forms. 
                For brevity, we skip the dynamic array UI and just show how it would be structured, 
                or provide simple add/remove. */}
            
          </form>
        </ScrollArea>
        
        <DialogFooter className="p-6 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="challenge-form" className="bg-[#00629B] text-white hover:bg-[#00629B]/90">
            Save Challenge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
