import { createClient } from '@/lib/supabase/client'

export async function testDatabaseConnection() {
  const supabase = createClient()
  
  console.log('🧪 Testing database connection...')
  
  try {
    // Test 1: Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.log('⚠️ Not authenticated (this is okay if testing locally)')
    } else {
      console.log('✅ Auth working, user:', user?.email)
    }
    
    // Test 2: Check if new tables exist
    const { data: profiles, error: profileError } = await supabase
      .from('user_fitness_profiles')
      .select('count')
      .limit(1)
    
    if (profileError) {
      console.error('❌ Error accessing user_fitness_profiles:', profileError)
      return false
    }
    console.log('✅ user_fitness_profiles table accessible')
    
    // Test 3: Check equipment reference
    const { data: equipment, error: equipError } = await supabase
      .from('equipment_types_reference')
      .select('*')
      .limit(5)
    
    if (equipError) {
      console.error('❌ Error accessing equipment_types_reference:', equipError)
      return false
    }
    console.log('✅ equipment_types_reference table accessible')
    console.log('📦 Sample equipment:', equipment)
    
    console.log('✅ All database tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return false
  }
}