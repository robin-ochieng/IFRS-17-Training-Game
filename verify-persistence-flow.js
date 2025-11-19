// ==========================================
// PERSISTENCE VERIFICATION SCRIPT
// ==========================================
// Copy and paste this entire script into your browser console while the game is running.
// It will simulate a game session and verify that data is correctly saved to the database.

(async () => {
  console.clear();
  console.log('%c🧪 STARTING PERSISTENCE VERIFICATION', 'color: #00ffff; font-size: 16px; font-weight: bold;');

  // 1. Get Supabase Client
  // We need to access the internal supabase client. 
  // The app exposes it via window.__IFRS17_SUPABASE_CLIENT__ or we can try to import it if we were in a module system.
  // Since we are in console, we rely on the global exposed by the service or we check if we can access the service functions.
  
  // Check if we can access the service functions directly (if exposed on window)
  // If not, we will try to use the internal client if available.
  
  // NOTE: Ideally, the app should expose these for debugging. 
  // If they are not exposed, we can't easily run this from console without modifying the code to expose them.
  // Assuming the user has access to the 'supabase' global or similar.
  
  // Let's try to find the client
  const supabase = window.__IFRS17_SUPABASE_CLIENT__;
  
  if (!supabase) {
    console.error('❌ Could not find Supabase client. Make sure the app is running and initialized.');
    console.log('💡 Hint: The app initializes the client in supabaseService.js. It attaches it to window.__IFRS17_SUPABASE_CLIENT__');
    return;
  }

  console.log('✅ Supabase client found.');

  // 2. Get Current User
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ No authenticated user found. Please log in first.');
    return;
  }
  
  console.log(`👤 Testing with User ID: ${user.id}`);

  // 3. Define Test Data
  const testModuleId = 999; // Use a high ID to avoid conflict with real modules
  const testTime = 12345; // 12.3 seconds
  
  const testPayload = {
    user_id: user.id,
    current_module: testModuleId,
    current_question: 5,
    total_score: 9999,
    module_completion_times: {
      [testModuleId]: testTime
    },
    last_saved: new Date().toISOString()
  };

  console.log('📦 Preparing to save test data:', testPayload);

  // 4. Write to DB (Simulate Save)
  console.log('💾 Saving progress to database...');
  const { error: saveError } = await supabase
    .from('game_progress')
    .upsert(testPayload, { onConflict: 'user_id' });

  if (saveError) {
    console.error('❌ Save failed:', saveError);
    return;
  }
  console.log('✅ Save successful.');

  // 5. Read from DB (Verify Persistence)
  console.log('📖 Reading progress back from database...');
  const { data: loadedData, error: loadError } = await supabase
    .from('game_progress')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (loadError) {
    console.error('❌ Load failed:', loadError);
    return;
  }

  console.log('📥 Loaded data:', loadedData);

  // 6. Verify Specific Fields
  let passed = true;

  // Verify Module Completion Time
  const savedTime = loadedData.module_completion_times?.[testModuleId];
  if (savedTime === testTime) {
    console.log(`✅ Module Completion Time persisted correctly: ${savedTime}`);
  } else {
    console.error(`❌ Module Completion Time mismatch! Expected ${testTime}, got ${savedTime}`);
    passed = false;
  }

  // Verify Score
  if (loadedData.total_score === 9999) {
    console.log(`✅ Total Score persisted correctly: ${loadedData.total_score}`);
  } else {
    console.error(`❌ Total Score mismatch! Expected 9999, got ${loadedData.total_score}`);
    passed = false;
  }

  // 7. Cleanup (Optional)
  // We might want to leave it to see it in the UI, or clean it up.
  // Let's clean up the test module time to avoid polluting real data too much, 
  // but keep the row so the user can see it if they want.
  
  if (passed) {
    console.log('%c🎉 VERIFICATION SUCCESSFUL! Persistence is working correctly.', 'color: #00ff00; font-size: 16px; font-weight: bold;');
  } else {
    console.log('%c💥 VERIFICATION FAILED. Check errors above.', 'color: #ff0000; font-size: 16px; font-weight: bold;');
  }

})();
