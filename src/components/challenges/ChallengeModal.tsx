import { useState } from 'react';
import { Challenge, DIFFICULTY_POINTS } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useChallengeStore } from '@/store/challengeStore';
import { Trophy, Download, Terminal, CheckCircle2, XCircle, Key, AlertTriangle, Copy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChallengeModalProps {
  challenge: Challenge;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChallengeModal({ challenge, isOpen, onClose }: ChallengeModalProps) {
  const [flagInput, setFlagInput] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const submitFlag = useChallengeStore((state) => state.submitFlag);
  const unlockHint = useChallengeStore((state) => state.unlockHint);
  
  const currentTeam = useChallengeStore((state) => state.currentTeam);
  const teamSolves = useChallengeStore((state) => state.teamSolves);
  const teamHintUnlocks = useChallengeStore((state) => state.teamHintUnlocks);
  const competitionStatus = useChallengeStore((state) => state.competitionStatus);
  
  const isSolved = currentTeam ? teamSolves.some(s => s.teamId === currentTeam.id && s.challengeId === challenge.id) : false;
  
  const unlockedHintIds = currentTeam ? teamHintUnlocks
    .filter(h => h.teamId === currentTeam.id && h.challengeId === challenge.id)
    .map(h => h.hintId) : [];

  const points = DIFFICULTY_POINTS[challenge.difficulty];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) return;
    
    if (!currentTeam) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }
    
    const success = await submitFlag(challenge.id, flagInput.trim());
    setSubmitStatus(success ? 'success' : 'error');
    if (!success) {
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] md:h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
          <div className="flex justify-between items-start gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                {challenge.title}
                {isSolved && <CheckCircle2 className="h-6 w-6 text-green-500" />}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm">
                Author: <span className="font-semibold text-foreground">{challenge.author}</span>
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="text-sm px-3 py-1 bg-background">
                {challenge.category}
              </Badge>
              <div className="flex items-center gap-1.5 text-[#00B4D8] font-bold font-mono">
                <Trophy className="h-4 w-4" />
                {points} pts
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            {/* Status Alert */}
            {competitionStatus !== 'running' && (
              <Alert variant="destructive" className="bg-destructive/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>🛑 Competencia en Pausa</AlertTitle>
                <AlertDescription>
                  No se pueden enviar flags en este momento.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">Briefing</h3>
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {challenge.description.split('\\n').map((line, i) => {
                  const parts = line.split(/\\*\\*(.*?)\\*\\*/g);
                  return (
                    <p key={i} className="mb-2">
                      {parts.map((part, j) => (j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part))}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Links / Connections */}
            {challenge.links && challenge.links.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">Target Instance</h3>
                <div className="flex flex-col gap-2">
                  {challenge.links.map((link, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-3">
                        <Terminal className="h-5 w-5 text-muted-foreground" />
                        <span className="font-mono text-sm text-[#00B4D8]">{link.url}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(link.url)}>
                        <Copy className="h-4 w-4 mr-2" /> Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {challenge.files && challenge.files.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">Artifacts</h3>
                <div className="flex flex-wrap gap-3">
                  {challenge.files.map((file, idx) => (
                    <Button key={idx} variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      {file.name}
                      <span className="text-xs text-muted-foreground ml-2">({file.size})</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Hints */}
            {challenge.hints && challenge.hints.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">Intel (Hints)</h3>
                <div className="flex flex-col gap-3">
                  {challenge.hints.map((hint, idx) => {
                    const isUnlocked = unlockedHintIds.includes(hint.id);
                    return (
                      <div key={hint.id} className="p-4 rounded-md border border-border/50 bg-card">
                        {isUnlocked ? (
                          <div className="flex items-start gap-3">
                            <Key className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div>
                              <p className="font-medium mb-1">Hint {idx + 1}</p>
                              <p className="text-sm text-muted-foreground">{hint.content}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm font-medium">Hint {idx + 1} locked</span>
                            </div>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => unlockHint(challenge.id, hint.id, hint.cost)}
                              disabled={competitionStatus !== 'running'}
                            >
                              Unlock (-{hint.cost} pts)
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 border-t border-border/50 bg-muted/10 sm:justify-center">
          <form onSubmit={handleSubmit} className="w-full">
            {isSolved ? (
              <div className="w-full p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center gap-3 text-green-500 font-bold">
                <CheckCircle2 className="h-6 w-6" />
                FLAG ACCEPTED! You have solved this challenge.
              </div>
            ) : (
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder={competitionStatus === 'running' ? "FLAG{...}" : "Competencia pausada"}
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  className={`flex-1 font-mono ${
                    submitStatus === 'error' ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                  disabled={submitStatus === 'success' || competitionStatus !== 'running'}
                />
                <Button 
                  type="submit" 
                  disabled={!flagInput.trim() || submitStatus === 'success' || competitionStatus !== 'running'}
                  className={submitStatus === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#00629B] hover:bg-[#00629B]/90 text-white dark:bg-[#00B4D8] dark:hover:bg-[#00B4D8]/90 dark:text-gray-900'}
                >
                  {submitStatus === 'error' ? <XCircle className="h-4 w-4 mr-2" /> : 'Submit'}
                  {submitStatus === 'error' ? 'Incorrect' : ''}
                </Button>
              </div>
            )}
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
