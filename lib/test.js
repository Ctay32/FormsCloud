import { supabase } from './supabaseClient.js'

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('_test').select('*').limit(1)
    
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase connection error:', error)
      return false
    }
    
    console.log(' Supabase connection successful!')
    return true
  } catch (err) {
    console.error(' Connection test failed:', err.message)
    return false
  }
}

// Run test if this file is executed directly
if (import.meta.url === ile://) {
  testConnection()
}

export { testConnection }
