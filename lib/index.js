import { supabase } from './supabaseClient.js'
import { testConnection } from './test.js'

console.log('🚀 FormCloud Application Starting...')

async function startApp() {
  try {
    // Test Supabase connection
    const isConnected = await testConnection()
    
    if (!isConnected) {
      console.error('❌ Failed to connect to Supabase. Please check your configuration.')
      process.exit(1)
    }
    
    console.log('🎉 FormCloud is ready!')
    console.log('📊 Supabase client initialized and connected')
    
    // Your application logic will go here
    console.log('✨ Application running successfully')
    
  } catch (error) {
    console.error('💥 Application startup failed:', error.message)
    process.exit(1)
  }
}

// Start the application
startApp()
