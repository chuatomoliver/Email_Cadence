export async function sendEmailActivity(subject: string, body: string) {
  console.log(`[Email Activity] Sending email: ${subject}`);
  console.log(`[Email Activity] Body: ${body}`);
  
  const result = {
    success: true,
    messageId: `msg_${Math.random().toString(36).substring(2, 11)}`,
    timestamp: Date.now(),
  };

  console.log(`[Email Activity] Result: ${JSON.stringify(result)}`);
  
  return result;
}
