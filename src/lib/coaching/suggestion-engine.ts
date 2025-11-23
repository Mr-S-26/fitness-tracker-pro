// Rule-based suggestion engine - fallback when AI is unavailable
import type { SetDifficulty, FormQuality } from '@/types/database';

interface SuggestionParams {
  difficulty: SetDifficulty;
  formQuality: FormQuality;
  currentWeight: number;
  currentReps: number;
  targetReps: number;
  isCompound: boolean;
  exerciseCategory?: string;
}

interface Suggestion {
  nextWeight: number;
  nextReps: number;
  restSeconds: number;
  reasoning: string;
  formTips?: string[];
  warnings?: string[];
}

export class SuggestionEngine {
  /**
   * Generate smart suggestions based on set performance
   */
  generateSuggestion(params: SuggestionParams): Suggestion {
    const {
      difficulty,
      formQuality,
      currentWeight,
      currentReps,
      targetReps,
      isCompound,
    } = params;

    // Base weight increments
    const heavyIncrement = isCompound ? 5 : 2.5;
    const lightIncrement = isCompound ? 2.5 : 1.25;

    let weightChange = 0;
    let repChange = 0;
    let restSeconds = this.calculateRestTime(difficulty, isCompound);
    let reasoning = '';
    const formTips: string[] = [];
    const warnings: string[] = [];

    // Analyze difficulty and determine changes
    switch (difficulty) {
      case 'too_easy':
        if (formQuality === 'perfect') {
          weightChange = heavyIncrement;
          reasoning = 'Great job! The weight was too light. Increasing significantly.';
        } else {
          repChange = 2;
          reasoning = 'Add reps first to perfect your form before adding weight.';
          formTips.push('Focus on controlled tempo and full range of motion');
        }
        break;

      case 'easy':
        if (formQuality === 'perfect') {
          weightChange = lightIncrement;
          reasoning = 'Solid set! Time for a small weight increase.';
        } else {
          repChange = 1;
          reasoning = 'Add one rep to build confidence with current weight.';
        }
        break;

      case 'perfect':
        if (formQuality === 'perfect') {
          reasoning = 'Perfect execution! Maintain this weight and reps.';
        } else {
          reasoning = 'Good difficulty, but focus on form quality next set.';
          formTips.push('Slow down the eccentric phase');
          formTips.push('Maintain tension throughout the movement');
        }
        break;

      case 'challenging':
        if (formQuality === 'poor') {
          weightChange = -lightIncrement;
          repChange = -1;
          reasoning = 'Form breakdown detected. Reducing weight to protect you.';
          warnings.push('Form quality is compromised - injury risk');
          formTips.push('Reset your setup between reps');
        } else {
          reasoning = 'That was tough! Keep the weight same, focus on recovery.';
          restSeconds += 30;
        }
        break;

      case 'failure':
        weightChange = -heavyIncrement;
        repChange = Math.max(-2, targetReps - currentReps);
        reasoning = 'Significant weight reduction needed. Lets rebuild safely.';
        warnings.push('You may be fatigued - consider if deload is needed');
        restSeconds += 60;
        break;
    }

    // Additional form quality checks
    if (formQuality === 'poor' && difficulty !== 'failure') {
      if (weightChange > 0) {
        weightChange = 0;
        reasoning += ' Weight held due to form issues.';
      }
      formTips.push('Record yourself to check form');
      formTips.push('Consider reducing range of motion if needed');
    }

    // Calculate final values
    const nextWeight = Math.max(currentWeight + weightChange, 0);
    const nextReps = Math.max(currentReps + repChange, 1);

    return {
      nextWeight: Math.round(nextWeight * 4) / 4, // Round to nearest 0.25kg
      nextReps: Math.min(nextReps, targetReps + 3), // Cap at target + 3
      restSeconds,
      reasoning,
      formTips: formTips.length > 0 ? formTips : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Calculate appropriate rest time based on difficulty and exercise type
   */
  private calculateRestTime(difficulty: SetDifficulty, isCompound: boolean): number {
    const baseRest = isCompound ? 120 : 90; // Base rest in seconds

    switch (difficulty) {
      case 'too_easy':
        return baseRest - 30;
      case 'easy':
        return baseRest - 15;
      case 'perfect':
        return baseRest;
      case 'challenging':
        return baseRest + 30;
      case 'failure':
        return baseRest + 60;
      default:
        return baseRest;
    }
  }

  /**
   * Analyze progression trends over multiple sets
   */
  analyzeProgressionTrend(sets: Array<{
    weight: number;
    reps: number;
    difficulty: SetDifficulty;
    formQuality: FormQuality;
  }>): {
    trend: 'improving' | 'maintaining' | 'declining';
    recommendation: string;
  } {
    if (sets.length < 3) {
      return {
        trend: 'maintaining',
        recommendation: 'Continue building data for analysis',
      };
    }

    // Analyze difficulty trend
    const difficultyScores = sets.map(s => this.difficultyToScore(s.difficulty));
    const isImproving = difficultyScores.every((score, i) => 
      i === 0 || score >= difficultyScores[i - 1]
    );
    const isDeclining = difficultyScores.every((score, i) => 
      i === 0 || score <= difficultyScores[i - 1]
    );

    // Analyze form trend
    const formScores = sets.map(s => this.formToScore(s.formQuality));
    const formDeclining = formScores[formScores.length - 1] < formScores[0];

    if (isImproving && !formDeclining) {
      return {
        trend: 'improving',
        recommendation: 'Excellent progression! Continue current strategy.',
      };
    } else if (isDeclining || formDeclining) {
      return {
        trend: 'declining',
        recommendation: 'Fatigue accumulating. Consider ending workout or reducing volume.',
      };
    } else {
      return {
        trend: 'maintaining',
        recommendation: 'Consistent performance. Ready for progression next session.',
      };
    }
  }

  private difficultyToScore(difficulty: SetDifficulty): number {
    const scores: Record<SetDifficulty, number> = {
      too_easy: 1,
      easy: 2,
      perfect: 3,
      challenging: 4,
      failure: 5,
    };
    return scores[difficulty];
  }

  private formToScore(form: FormQuality): number {
    const scores: Record<FormQuality, number> = {
      poor: 1,
      good: 2,
      perfect: 3,
    };
    return scores[form];
  }

  /**
   * Determine if deload is recommended
   */
  shouldDeload(recentWorkouts: Array<{
    overallDifficulty: SetDifficulty;
    formQuality: FormQuality;
  }>): {
    shouldDeload: boolean;
    reason?: string;
  } {
    if (recentWorkouts.length < 3) {
      return { shouldDeload: false };
    }

    // Check for consistent high difficulty
    const highDifficultyCount = recentWorkouts.filter(
      w => w.overallDifficulty === 'challenging' || w.overallDifficulty === 'failure'
    ).length;

    // Check for form degradation
    const poorFormCount = recentWorkouts.filter(
      w => w.formQuality === 'poor'
    ).length;

    if (highDifficultyCount >= 2) {
      return {
        shouldDeload: true,
        reason: 'Multiple consecutive difficult sessions indicate accumulated fatigue',
      };
    }

    if (poorFormCount >= 2) {
      return {
        shouldDeload: true,
        reason: 'Form quality declining - take a deload week to recover',
      };
    }

    return { shouldDeload: false };
  }
}

// Singleton instance
let engineInstance: SuggestionEngine | null = null;

export function getSuggestionEngine(): SuggestionEngine {
  if (!engineInstance) {
    engineInstance = new SuggestionEngine();
  }
  return engineInstance;
}