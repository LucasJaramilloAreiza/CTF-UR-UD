import { Challenge, DIFFICULTY_POINTS } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChallengeCardProps {
  challenge: Challenge;
  isSolved: boolean;
  onClick: () => void;
}

export default function ChallengeCard({ challenge, isSolved, onClick }: ChallengeCardProps) {
  const points = DIFFICULTY_POINTS[challenge.difficulty];
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer h-full flex flex-col transition-all duration-200 border-2 ${
          isSolved 
            ? 'border-green-500/50 bg-green-500/5 dark:bg-green-500/10' 
            : 'hover:border-[#00B4D8]/50 border-border'
        }`}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="bg-background/50">
              {challenge.category}
            </Badge>
            <Badge 
              variant={challenge.difficulty === 'Easy' ? 'default' : challenge.difficulty === 'Medium' ? 'secondary' : 'destructive'}
              className={challenge.difficulty === 'Easy' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
            >
              {challenge.difficulty}
            </Badge>
          </div>
          <CardTitle className="mt-2 text-xl font-bold tracking-tight group-hover:text-[#00B4D8] transition-colors line-clamp-1">
            {challenge.title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            By {challenge.author}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {isSolved ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium mt-4">
              <CheckCircle2 className="h-5 w-5" />
              <span>Solved</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {challenge.description.split('\\n')[0]}...
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 font-mono font-bold text-[#00629B] dark:text-[#00B4D8]">
            <Trophy className="h-4 w-4" />
            {points} pts
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
