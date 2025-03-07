/**
 * Loads messages for a specific locale
 */
export async function getMessages(locale: string = 'en') {
  try {
    // Dynamically import the messages based on locale
    let messages;
    
    try {
      // Try to load the requested locale
      messages = await import(`../../messages/${locale}.json`);
    } catch (err) {
      console.error(`Could not load locale ${locale}, falling back to English:`, err);
      // Fall back to English
      messages = await import('../../messages/en.json');
    }
    
    return messages.default;
  } catch (error) {
    console.error(`Critical error loading messages:`, error);
    return {}; // Return empty object on critical error
  }
} 