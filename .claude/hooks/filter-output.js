// PreToolUse-Hook: kürzt lange Ausgaben von Prüfbefehlen auf 80 Zeilen, damit weniger Tokens verbraucht werden.
// Vorlage: https://code.claude.com/docs/en/costs (Beispiel "filter-test-output"), hier in Node statt bash+jq.
let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return console.log('{}');
  }
  const cmd = String((input.tool_input && input.tool_input.command) || '').trim();
  // Nur einfache Befehle ohne Pipes, Umleitungen oder Verkettungen anfassen
  const pattern = /^(npx tsc --noEmit|npx expo-doctor|npm test|npx jest)( [^;&|<>`$#\\\r\n]*)?$/;
  if (!pattern.test(cmd)) return console.log('{}');
  const filtered =
    `${cmd} 2>&1 | awk 'NR<=80; END{if(NR>80) print "... " NR-80 " weitere Zeilen gekuerzt"}'; exit \${PIPESTATUS[0]}`;
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        updatedInput: { ...input.tool_input, command: filtered },
      },
    })
  );
});
