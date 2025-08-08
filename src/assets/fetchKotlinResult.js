export async function fetchKotlinResult() {
  try {
    const response = await fetch('http://10.0.2.2:5001/news');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const json = await response.json();
    console.log('FETCH KOTLIN REQUEST: ',json);
    return json; // ← return the data to the caller
  } catch (error) {
    console.error('❌ Error fetching fact-check result:', error);
    throw error; // you can handle it later
  }
}
