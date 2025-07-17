// Test script to debug date parsing issues
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  console.log('Original date string:', dateString);
  console.log('Type:', typeof dateString);
  
  let date;
  
  // Handle ISO date strings (like "2026-10-09T00:00:00.000Z")
  if (dateString.includes('T') || dateString.includes('Z')) {
    date = new Date(dateString);
    console.log('Parsed as ISO date:', date);
  } else {
    // Handle simple date strings (like "2026-10-09")
    // Parse as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date in local timezone by using local time constructor
    date = new Date(year, month - 1, day, 12, 0, 0); // Use noon to avoid DST issues
    console.log('Parsed as simple date (fixed):', date);
  }
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateString);
    return 'Invalid Date';
  }
  
  // Format the date
  const formatted = date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  console.log('Formatted result:', formatted);
  return formatted;
};

// Test different date formats
console.log('=== Testing Fixed Date Parsing ===');
console.log('Test 1 - ISO with Z:');
formatDate('2026-10-10T00:00:00.000Z');

console.log('\nTest 2 - ISO without Z:');
formatDate('2026-10-10T00:00:00.000');

console.log('\nTest 3 - Simple date (should show Oct 10):');
formatDate('2026-10-10');

console.log('\nTest 4 - Another simple date (should show Oct 9):');
formatDate('2026-10-09'); 