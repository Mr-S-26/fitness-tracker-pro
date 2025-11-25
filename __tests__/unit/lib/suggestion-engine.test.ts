import { SuggestionEngine, getSuggestionEngine } from '@/lib/coaching/suggestion-engine'

describe('SuggestionEngine', () => {
  let engine: SuggestionEngine

  beforeEach(() => {
    engine = getSuggestionEngine()
  })

  describe('generateSuggestion', () => {
    describe('Too Easy Difficulty', () => {
      it('should increase weight significantly with perfect form', () => {
        const suggestion = engine.generateSuggestion({
          difficulty: 'too_easy',
          formQuality: 'perfect',
          currentWeight: 60,
          currentReps: 8,
          targetReps: 8,
          isCompound: true,
          exerciseCategory: 'chest',
        })

        expect(suggestion.nextWeight).toBeGreaterThan(60)
        expect(suggestion.nextWeight).toBe(65) // +5kg for compound
        expect(suggestion.reasoning).toContain('increase')
      })

      it('should add reps with poor form', () => {
        const suggestion = engine.generateSuggestion({
          difficulty: 'too_easy',
          formQuality: 'poor',
          currentWeight: 60,
          currentReps: 8,
          targetReps: 8,
          isCompound: true,
        })

        expect(suggestion.nextWeight).toBe(60) // No weight increase
        expect(suggestion.nextReps).toBeGreaterThan(8)
        expect(suggestion.formTips).toBeDefined()
      })
    })

    describe('Easy Difficulty', () => {
      it('should increase weight slightly with perfect form', () => {
        const suggestion = engine.generateSuggestion({
          difficulty: 'easy',
          formQuality: 'perfect',
          currentWeight: 60,
          currentReps: 8,
          targetReps: 8,
          isCompound: true,
        })

        expect(suggestion.nextWeight).toBe(62.5) // +2.5kg for compound
        expect(suggestion.reasoning).toContain('small weight increase')
      })
    })

    describe('Perfect Difficulty', () => {
      it('should maintain weight and reps with perfect form', () => {
        const suggestion = engine.generateSuggestion({
          difficulty: 'perfect',
          formQuality: 'perfect',
          currentWeight: 60,
          currentReps: 8,
          targetReps: 8,
          isCompound: true,
        })

        expect(suggestion.nextWeight).toBe(60)
        expect(suggestion.nextReps).toBe(8)
        expect(suggestion.reasoning).toContain('maintain')
      })

      it('should give form tips with good form', () => {
        const suggestion = engine.generateSuggestion({
          difficulty: 'perfect',
          formQuality: 'good',
          currentWeight: 60,
          currentReps: 8,
          targetReps: 8,
          isCompound: true,
        })

        expect(suggestion.formTips).toBeDefined()
        expect(suggestion.formTips!.length).toBeGreaterThan(0)
      })
    })

    describe('Challenging Difficulty', () => {
      it('should reduce weight with poor form', () => {
        const suggestion = engine.generateSuggestion({
          difficulty: 'challenging',
          formQuality: 'poor',
          currentWeight: 60,
          currentReps: 8,
          targetReps: 8,
          isCompound: true,
        })

        expect(suggestion.nextWeight).toBeLessThan(60)
        expect(suggestion.warnings).toBeDefined()
        expect(suggestion.warnings!.length).toBeGreaterThan(0)
      })

      it('should maintain weight with good form but increase rest', () => {
        const suggestion = engine.generateSuggestion({
          difficulty: 'challenging',
          formQuality: 'good',
          currentWeight: 60,
          currentReps: 8,
          targetReps: 8,
          isCompound: true,
        })

        expect(suggestion.nextWeight).toBe(60)
        expect(suggestion.restSeconds).toBeGreaterThan(120) // Base rest + 30
      })
    })

    describe('Failure Difficulty', () => {
      it('should significantly reduce weight', () => {
        const suggestion = engine.generateSuggestion({
          difficulty: 'failure',
          formQuality: 'poor',
          currentWeight: 60,
          currentReps: 5,
          targetReps: 8,
          isCompound: true,
        })

        expect(suggestion.nextWeight).toBeLessThan(60)
        expect(suggestion.nextWeight).toBe(55) // -5kg for compound
        expect(suggestion.warnings).toBeDefined()
        expect(suggestion.restSeconds).toBeGreaterThan(120) // Extra rest
      })
    })

    describe('Compound vs Isolation', () => {
      it('should use larger increments for compound exercises', () => {
        const compoundSuggestion = engine.generateSuggestion({
          difficulty: 'too_easy',
          formQuality: 'perfect',
          currentWeight: 60,
          currentReps: 8,
          targetReps: 8,
          isCompound: true,
        })

        const isolationSuggestion = engine.generateSuggestion({
          difficulty: 'too_easy',
          formQuality: 'perfect',
          currentWeight: 60,
          currentReps: 8,
          targetReps: 8,
          isCompound: false,
        })

        expect(compoundSuggestion.nextWeight - 60).toBeGreaterThan(
          isolationSuggestion.nextWeight - 60
        )
      })

      it('should give longer rest for compound exercises', () => {
        const compoundSuggestion = engine.generateSuggestion({
          difficulty: 'perfect',
          formQuality: 'perfect',
          currentWeight: 60,
          currentReps: 8,
          targetReps: 8,
          isCompound: true,
        })

        const isolationSuggestion = engine.generateSuggestion({
          difficulty: 'perfect',
          formQuality: 'perfect',
          currentWeight: 60,
          currentReps: 8,
          targetReps: 8,
          isCompound: false,
        })

        expect(compoundSuggestion.restSeconds).toBeGreaterThan(isolationSuggestion.restSeconds)
      })
    })
  })

  describe('analyzeProgressionTrend', () => {
    it('should detect improving trend', () => {
      const sets = [
        { weight: 60, reps: 8, difficulty: 'too_easy' as const, formQuality: 'perfect' as const },
        { weight: 65, reps: 8, difficulty: 'easy' as const, formQuality: 'perfect' as const },
        { weight: 70, reps: 8, difficulty: 'perfect' as const, formQuality: 'perfect' as const },
      ]

      const result = engine.analyzeProgressionTrend(sets)

      expect(result.trend).toBe('improving')
      expect(result.recommendation).toContain('continue')
    })

    it('should detect declining trend', () => {
      const sets = [
        { weight: 70, reps: 8, difficulty: 'perfect' as const, formQuality: 'perfect' as const },
        { weight: 70, reps: 7, difficulty: 'challenging' as const, formQuality: 'good' as const },
        { weight: 70, reps: 6, difficulty: 'failure' as const, formQuality: 'poor' as const },
      ]

      const result = engine.analyzeProgressionTrend(sets)

      expect(result.trend).toBe('declining')
      expect(result.recommendation).toContain('fatigue')
    })

    it('should detect maintaining trend', () => {
      const sets = [
        { weight: 60, reps: 8, difficulty: 'perfect' as const, formQuality: 'good' as const },
        { weight: 60, reps: 8, difficulty: 'perfect' as const, formQuality: 'good' as const },
        { weight: 60, reps: 8, difficulty: 'perfect' as const, formQuality: 'perfect' as const },
      ]

      const result = engine.analyzeProgressionTrend(sets)

      expect(result.trend).toBe('maintaining')
    })
  })

  describe('shouldDeload', () => {
    it('should recommend deload after consistent high difficulty', () => {
      const recentWorkouts = [
        { overallDifficulty: 'challenging' as const, formQuality: 'good' as const },
        { overallDifficulty: 'failure' as const, formQuality: 'good' as const },
        { overallDifficulty: 'challenging' as const, formQuality: 'good' as const },
      ]

      const result = engine.shouldDeload(recentWorkouts)

      expect(result.shouldDeload).toBe(true)
      expect(result.reason).toContain('fatigue')
    })

    it('should recommend deload with declining form', () => {
      const recentWorkouts = [
        { overallDifficulty: 'perfect' as const, formQuality: 'poor' as const },
        { overallDifficulty: 'perfect' as const, formQuality: 'poor' as const },
        { overallDifficulty: 'perfect' as const, formQuality: 'good' as const },
      ]

      const result = engine.shouldDeload(recentWorkouts)

      expect(result.shouldDeload).toBe(true)
      expect(result.reason).toContain('form')
    })

    it('should not recommend deload for good performance', () => {
      const recentWorkouts = [
        { overallDifficulty: 'perfect' as const, formQuality: 'perfect' as const },
        { overallDifficulty: 'easy' as const, formQuality: 'perfect' as const },
        { overallDifficulty: 'perfect' as const, formQuality: 'good' as const },
      ]

      const result = engine.shouldDeload(recentWorkouts)

      expect(result.shouldDeload).toBe(false)
    })
  })

  describe('calculateRestTime', () => {
    it('should adjust rest based on difficulty', () => {
      const easyRest = engine.generateSuggestion({
        difficulty: 'too_easy',
        formQuality: 'perfect',
        currentWeight: 60,
        currentReps: 8,
        targetReps: 8,
        isCompound: true,
      }).restSeconds

      const hardRest = engine.generateSuggestion({
        difficulty: 'challenging',
        formQuality: 'good',
        currentWeight: 60,
        currentReps: 8,
        targetReps: 8,
        isCompound: true,
      }).restSeconds

      expect(hardRest).toBeGreaterThan(easyRest)
    })
  })

  describe('Edge Cases', () => {
    it('should not suggest negative weight', () => {
      const suggestion = engine.generateSuggestion({
        difficulty: 'failure',
        formQuality: 'poor',
        currentWeight: 2.5,
        currentReps: 3,
        targetReps: 8,
        isCompound: false,
      })

      expect(suggestion.nextWeight).toBeGreaterThanOrEqual(0)
    })

    it('should cap rep increases', () => {
      const suggestion = engine.generateSuggestion({
        difficulty: 'too_easy',
        formQuality: 'perfect',
        currentWeight: 60,
        currentReps: 15,
        targetReps: 8,
        isCompound: true,
      })

      expect(suggestion.nextReps).toBeLessThanOrEqual(18) // target + 3
    })

    it('should round weights to nearest 0.25kg', () => {
      const suggestion = engine.generateSuggestion({
        difficulty: 'easy',
        formQuality: 'perfect',
        currentWeight: 60,
        currentReps: 8,
        targetReps: 8,
        isCompound: true,
      })

      const decimal = suggestion.nextWeight % 0.25
      expect(decimal).toBe(0)
    })
  })
})