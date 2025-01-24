document.getElementById('onay-form').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const username = localStorage.getItem("username");
    const verificationCode = [
      document.getElementById('digit-1').value,
      document.getElementById('digit-2').value,
      document.getElementById('digit-3').value,
      document.getElementById('digit-4').value,
    ].join('');
  
    try {
      const response = await fetch('http://localhost:8003/twofactor/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({ username, code: verificationCode }),
    });
      
      alert(response.status);
      alert(JSON.stringify({ username, code: verificationCode }));
       
      if (!response.ok) {
        throw new Error(await response.text()); // Get specific error message from response
      }
  
      const data = await response.json();
      // Handle successful response (e.g., redirect to the protected resource)
      console.log('Verification successful:', data);
    } catch (error) {
      handleError(error); // Call a separate function to handle errors
    } 
  });
  
  function handleError(error) {
    console.error('Error:', error);
    let errorMessage = 'An error occurred.';
  
    if (error.message === 'Invalid code. Please try again.') {
      errorMessage = error.message;
    } else if (error.message.includes('Network error')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else {
      // Handle other error scenarios
    }
  
    alert(errorMessage);
  }
  
  // ... (rest of your code for input handling)