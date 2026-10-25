try {
  const response = await fetch('http://127.0.0.1:3001/api/reset', { method: 'POST' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  console.log('Demo records reset. Refresh your browser to reload them.');
} catch (error) {
  console.error(`Could not reset the demo API: ${error.message}. Is npm start running?`);
  process.exitCode = 1;
}
